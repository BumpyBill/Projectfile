# Projectfile

Run Projects Locally With Ease

---

## Usage

```bash
projectfile <dir>
```

## Installation

> Installing Projectfile globally

```bash
npm i projectfile --g
```

> Installing Projectfile locally

```bash
npm i projectfile --save-dev
```

---

## VSCode Support

Click [here](https://marketplace.visualstudio.com/items?itemName=bumpy.projectfile) to download the VSCode extension that provides Syntax Highlighting and a file icon

---

## Documentation

#### Environment Variables

```dockerfile
ENV <name> <value>
```

#### Environment Variables

```dockerfile
CMD <string(command|batch file location)> [ENV options]
```

#### Environment Variable Options

##### - Detached

On Windows, setting `options.detached` to `true` makes it possible for the child process to continue running after the parent exits.
