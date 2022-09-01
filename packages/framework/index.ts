
const settings: unique symbol = Symbol("settings");
// declare global {
    interface Object {
        [settings]: ElementSettings
    }
// }

interface ElementSettings extends ElementDefinitionOptions {
    /**
     * Gets the custom Web Component define tag name.
     */
    readonly name: string;
}

interface ElementSettingsArgs extends ElementDefinitionOptions {
    name?: string;
}

function tagName<TFunction extends Function>(target: TFunction) {
    const name = target.name.replace(/([a-z0–9])([A-Z])/, "$1-$2").toLowerCase();
    if (name.indexOf("-") == -1) {
        throw new Error(`Defined element for class' ${target.name}' lacks a dash in the auto-generated tag name '${name}'.`);
    }
    return name;
}

interface CustomElementConstructorFunction extends Function, CustomElementConstructor {
}

function element(settings?: ElementSettingsArgs): <TFunction extends CustomElementConstructorFunction>(target: TFunction) => TFunction | void;
function element<TFunction extends CustomElementConstructorFunction>(target: TFunction): TFunction | void;
function element<TFunction extends CustomElementConstructorFunction>(args?: ElementSettingsArgs | TFunction) {
    if (args instanceof Function) {
        // Args here is target: TFunction
        const name = tagName(args);
        args[settings] = { name }
        customElements.define(name, args);
    } else if (args) {
        if ("name" in args) {
            if (args.name.indexOf("-") == -1) {
                throw new Error(`Defined element tag name lacks a dash '${args.name}'`);
            }
        }

        return <TFunction extends Function>(ctor: TFunction) => {
            let name = args.name ?? tagName(ctor);
            ctor[settings] = { ...args, name };
            customElements.define(name, ctor as any, args);
        }
    } else {
        return element;
    }
}

@element
class XuiButton extends HTMLElement {
}

@element({
    name: "xui-button2"
})
class Button2 extends HTMLElement {
}
