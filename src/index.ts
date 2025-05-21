import { copyToClipboard } from './helpers/copyToClipboard';
import {
  isInitCollectionsMessage,
  isInitStylesMessage,
  isExportMessage,
} from './helpers/message';
import { GenerateMessage, Message } from './types';

import './styles.css';

type Collection = {
  id: string;
  name: string;
};

function createInputField(name: string, value: string) {
  const label = document.createElement('label');
  label.style.display = 'block';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.value = value;
  input.checked = true;

  label.appendChild(input);
  label.append(` ${name}`);

  return label;
}

function init() {
  addMessageListener();
  handleCopyButtonClick();
  handleExportButtonClick();
}

function clearExcept(container: HTMLElement, selector: string) {
  const toKeep = container.querySelector(selector);

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  if (toKeep) {
    container.appendChild(toKeep);
  }
}

function addMessageListener() {
  window.onmessage = async (e) => {
    const msg = e.data.pluginMessage satisfies Message;

    if (isInitCollectionsMessage(msg)) {
      // Init inner collections
      const container = document.querySelector<HTMLElement>('.collections');

      if (container) {
        clearExcept(container, 'legend');

        msg.collections.forEach((collection: Collection) => {
          const element = createInputField(collection.name, collection.id);

          container.appendChild(element);
        });
      }
    }

    if (isInitStylesMessage(msg)) {
      // Init inner styles
      const { styles } = msg;
      const stylesContainer = document.querySelector<HTMLElement>('.styles');

      if (stylesContainer) {
        clearExcept(stylesContainer, 'legend');

        for (const style of styles) {
          const element = createInputField(style, style);

          stylesContainer.appendChild(element);
        }
      }
    }

    if (isExportMessage(msg)) {
      const result = document.querySelector<HTMLTextAreaElement>('.result');

      if (!result) {
        throw new Error('No result textarea');
      }

      if (msg.css) {
        result.value = msg.css;

        return;
      }

      result.value = '';
    }
  };
}

function handleExportButtonClick() {
  const exportButton =
    document.querySelector<HTMLButtonElement>('.exportButton');
  exportButton?.addEventListener('click', () => {
    const input = document.querySelector<HTMLInputElement>(
      'input[name="unit"]:checked'
    );

    if (!input) {
      throw new Error('No unit selected');
    }

    const unit = input.value;

    if (unit !== 'rem' && unit !== 'px') {
      throw new Error('Invalid unit');
    }

    const selectedCollections = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        '.collections input[type="checkbox"]'
      )
    )
      .filter((element) => element.checked)
      .map((element) => element.value);

    const selectedStyles = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        '.styles input[type="checkbox"]'
      )
    )
      .filter((element) => element.checked)
      .map((element) => element.value);

    const remSize = document.querySelector<HTMLInputElement>('.fontSize');

    if (!remSize) {
      throw new Error('No rem size selected');
    }

    const remValue = remSize.value;

    parent.postMessage(
      {
        pluginMessage: {
          type: 'generate',
          unit: unit as 'px' | 'rem',
          remValue: Number(remValue) || 16,
          collections: selectedCollections,
          styles: selectedStyles,
        } satisfies GenerateMessage,
      },
      '*'
    );
  });
}

function handleCopyButtonClick() {
  const copyButton = document.querySelector<HTMLButtonElement>('.copyButton');

  copyButton?.addEventListener('click', async () => {
    const textArea = document.querySelector<HTMLTextAreaElement>('.result');

    if (!textArea) {
      throw new Error('No result textarea');
    }

    await copyToClipboard(textArea.value);

    const confirmationBlock =
      document.querySelector<HTMLDivElement>('.confirmation');

    if (!confirmationBlock) {
      throw new Error('No confirmation block');
    }

    if (textArea.value) {
      confirmationBlock.classList.remove('hidden');

      setTimeout(() => {
        confirmationBlock.classList.add('hidden');
      }, 1500);
    }
  });
}

init();
