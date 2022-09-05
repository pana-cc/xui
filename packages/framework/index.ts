
interface CustomElementConstructorFunction extends Function, CustomElementConstructor, ElementDefinitionOptions {
    tag?: string;
    template?: string;
}

function element<TFunction extends CustomElementConstructorFunction>(target: TFunction): TFunction | void {
    // If the `static tag = "my-component"` is ommited, infer a tag name
    if (!target.tag) {
        target.tag = target.name
            .replace(/([A-Z]+|[A-Z][a-z]*)([A-Z])/, "$1-$2")
            .toLowerCase();
    }

    Object.defineProperty(target.prototype, Symbol.toStringTag, {
        get() {
            return target.name;
        },
    });

    // Define the custom element
    customElements.define(target.tag, target, target);
}

const shadowRootFragment: unique symbol = Symbol("shadow root fragment");
// declare global {
    interface Object {
        /**
         * Gets the {@link DocumentFragment} associated with the prototype of this web component.
         */
        [shadowRootFragment]: undefined | Error | DocumentFragment;
    }
// }

function applyTemplate(this: HTMLElement) {
    let fragment = this[shadowRootFragment];

    if (fragment instanceof Error) {
        // The inital parse or tempalte resolution had resulted in error. We will rethrow, and won't try to parse again.
        throw fragment;
    }

    if (fragment === undefined) {
        // Not yet loaded. Perform the initial parse.
        const proto = Object.getPrototypeOf(this);
        try {
            const parser = new DOMParser();
            const document = parser.parseFromString((this.constructor as CustomElementConstructorFunction).template, "text/html");
            const templates = document.getElementsByTagName("template");
            let template: null | HTMLElement = null;
    
            if (templates.length == 1 && (!templates[0].id || templates[0].id == this.tagName)) {
                template = templates[0];
            } else {
                template = document.getElementById(this.tagName);
            }
    
            if (!(template instanceof HTMLTemplateElement)) {
                throw new Error(`Failed to parse a template for ${this}, looked for a single <template> or a <template id="${this.tagName}">. Got: ${template}`);
            }

            fragment = template.content;
            proto[shadowRootFragment] = fragment;
        } catch (e) {
            proto[shadowRootFragment] = e;
            throw e;
        }
    }

    this.attachShadow({ mode: 'open' }).appendChild(fragment.cloneNode(true));
}

@element class XUIButton extends HTMLElement {
    static template = `
        <template>
            <style>
                :host {
                    color: var(--xui-button-color);
                    font-family: var(--xui-input-font-family);

                    background: var(--xui-button-background);
                    border: 1px solid var(--xui-button-border);
                    border-radius: var(--xui-input-border-radius);

                    cursor: pointer;
                    user-select: none;
                    padding: 0.2em 3em;
                }
                :host(:hover) {
                    background: var(--xui-button-background-hover);
                }
                :host(:focus-visible) {
                    outline:var(--xui-focus-outline) !important;
                    outline-offset: var(--xui-focus-offset);
                }
            </style>
            <slot></slot>
        </template>`;

    protected connectedCallback() {
        applyTemplate.apply(this);
    }

    protected disconnectedCallback() {}
    protected attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {}
    protected adoptedCallback() {}
}

@element class XUISubmit extends HTMLInputElement {
    static extends = "input";
}

@element class XUIForm extends HTMLFormElement {
    static extends = "form";
}
