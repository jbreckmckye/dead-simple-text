export function el (selector: string) {
  const result = document.querySelector(selector);
  if (!result) {
    throw new Error('Invariant - no element found for selector ' + selector);
  } else {
    return result;
  }
}
