import { useEffect } from 'react';

const FORM_ASSET_URL = '/forms/whatsapp-lead-form.html';
const FORM_INSTANCE_SELECTOR = '[data-lr-initialized="443b4bd3-bf3a-4244-9e88-5735c2fba5f6"]';

export default function WhatsAppLeadFormLoader() {
  useEffect(() => {
    if (document.querySelector(FORM_INSTANCE_SELECTOR)) return;

    const controller = new AbortController();

    const mountForm = async () => {
      const response = await fetch(FORM_ASSET_URL, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`Unable to load WhatsApp lead form (${response.status})`);
      }

      if (controller.signal.aborted || document.querySelector(FORM_INSTANCE_SELECTOR)) return;

      const staging = document.createElement('div');
      staging.hidden = true;
      staging.innerHTML = await response.text();

      const host = staging.querySelector<HTMLElement>('.locus-html-form');
      if (!host) throw new Error('WhatsApp lead form asset is missing its host element');

      document.body.appendChild(staging);
      staging.hidden = false;

      const scripts = Array.from(host.querySelectorAll<HTMLScriptElement>('script'));
      scripts.forEach((script) => {
        const executable = document.createElement('script');

        Array.from(script.attributes).forEach((attribute) => {
          executable.setAttribute(attribute.name, attribute.value);
        });

        executable.text = script.text;
        script.replaceWith(executable);
      });

      staging.remove();
    };

    void mountForm().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('[WhatsApp lead form] Failed to initialize', error);
    });

    return () => controller.abort();
  }, []);

  return null;
}
