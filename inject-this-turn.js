import { createThoughtMessage } from './thought.js';
import { isMajorDirection } from './major-direction.js';

function safeStringify(value) {
  try {
    const serialized = JSON.stringify(value);
    return serialized === undefined
      ? { ok: false, value: '' }
      : { ok: true, value: serialized };
  } catch {
    return { ok: false, value: '' };
  }
}

export function messageText(message) {
  if (!Array.isArray(message?.content)) {
    return '';
  }
  return message.content
    .filter((block) => block?.type === 'text')
    .map((block) => block.text)
    .join('');
}

export function batchNeedsThought(messages) {
  if (!Array.isArray(messages)) {
    return false;
  }
  const hasGuidingThought = messages.some(
    (message) => message?.source?.kind === 'guiding-thought',
  );
  if (hasGuidingThought) {
    return false;
  }
  return messages.some((message) => isMajorDirection(messageText(message)));
}

export function appendThoughtIfNeeded(decision, id) {
  if (decision.kind !== 'enter') {
    return decision;
  }
  if (!batchNeedsThought(decision.messages)) {
    return decision;
  }
  return {
    ...decision,
    messages: [...decision.messages, createThoughtMessage(id)],
  };
}

export function additionalContextsForToolResult(exec, result, id) {
  const chunks = [];
  const hasArguments = exec != null && Object.hasOwn(exec, 'arguments');
  if (hasArguments) {
    const serializedArguments = safeStringify(exec.arguments);
    if (!serializedArguments.ok) {
      return [];
    }
    if (serializedArguments.value) {
      chunks.push(serializedArguments.value);
    }
  }
  const content = result?.content;
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block?.type === 'text') {
        chunks.push(block.text);
      }
    }
  }
  if (chunks.some((chunk) => isMajorDirection(chunk))) {
    return [createThoughtMessage(id)];
  }
  return [];
}
