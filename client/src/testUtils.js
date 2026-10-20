import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

const mountedRoots = [];

export function render(element) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push({ root, container });
  act(() => root.render(element));
  return {
    container,
    unmount() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

function accessibleName(element) {
  return element.getAttribute('aria-label') || element.getAttribute('alt') || element.textContent.trim();
}

export const screen = {
  getByRole(role, { name } = {}) {
    const roleSelectors = {
      button: 'button',
      heading: 'h1, h2, h3, h4, h5, h6',
      img: 'img',
      link: 'a',
      textbox: 'input:not([type="button"]):not([type="submit"]), textarea',
    };
    const found = [...document.body.querySelectorAll(roleSelectors[role] || `[role="${role}"]`)]
      .find((element) => name === undefined || (name instanceof RegExp
        ? name.test(accessibleName(element))
        : accessibleName(element) === name));
    if (!found) throw new Error(`No element found with role ${role}${name ? ` and name ${name}` : ''}`);
    return found;
  },
  getByText(text) {
    const found = [...document.body.querySelectorAll('body *')]
      .find((element) => element.children.length === 0 && (text instanceof RegExp
        ? text.test(element.textContent)
        : element.textContent === text));
    if (!found) throw new Error(`No element found with text ${text}`);
    return found;
  },
  getByLabelText(label) {
    const found = document.body.querySelector(`[aria-label="${label}"]`);
    if (!found) throw new Error(`No element found with label ${label}`);
    return found;
  },
};

export function cleanup() {
  mountedRoots.splice(0).forEach(({ root, container }) => {
    act(() => root.unmount());
    container.remove();
  });
}

export const fireEvent = {
  change(element, { target }) {
    act(() => {
      if (target && Object.prototype.hasOwnProperty.call(target, 'value')) {
        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;
        if (setter) setter.call(element, target.value);
        else element.value = target.value;
      }
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });
  },
  click(element) {
    act(() => element.click());
  },
};

export { act };
