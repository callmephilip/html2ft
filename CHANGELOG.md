# Change Log

All notable changes to the "html2ft" extension will be documented in this file.

## 0.1.0

- Initial release

## 0.2.0

- Run conversion locally

## 0.3.0

- Support extension settings

## 0.4.0

- New converter

## 0.5.0

- Relax VS code version requirements

## 0.6.0

- Improve SVG handling

## 0.7.0

- Improve code formatting

## 0.8.0

- Correctly parse alpinejs attrs like `x-transition.opacity.duration.600ms`
- Group kw args into 1 dictionary `Div(**{'x-transition.opacity.duration.600ms': True},  **{'x-transition.scale.origin.top': True})` becomes `Div(**{'x-transition.opacity.duration.600ms': True, 'x-transition.scale.origin.top': True})`
