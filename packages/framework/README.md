# The XUI Framework
Core instruments to develop custom Web Components based apps with TypeScript.

## @element
Contains TypeScript decorator to define custom Web Components. The following code will create a XuiButton class and will register it as `xui-button` custom web component for use in HTML:
```
@element
class XuiButton extends HTMLElement {
}
```

The `@element` can also be parameterized:
```
@element({
    name: "xui-button2"
})
class Button2 extends HTMLElement {
}
```

## Templating
Comming soon...