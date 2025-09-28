---
title: TypeScript
date: 2024-05-28 22:12:25
background: bg-[#4476c0]
tags:
  - ts
  - web
categories:
  - Programming
intro: |
  A TypeScript cheat sheet with the most important concepts, functions, methods, and more. A complete quick reference for beginners.
plugins:
  - copyCode
  - runCode
---

## Getting Started

### Installing the Compiler

```shell
npm install typescript --save-dev
npm tsc
```

## Basic DataTypes

### basic types

```ts
let isDone: boolean = false;
let age: number = 30;
let userName: string = "John";
let list: number[] = [1, 2, 3];
let tuple: [string, number] = ["hello", 10];
let notSure: any = 4;
notSure = "maybe a string instead";
```

### enums

```ts
enum Color {
  Red,
  Green,
  Blue,
}
let c: Color = Color.Green;
```

### interface

```ts
interface Person {
  firstName: string;
  lastName: string;
  age?: number; // Optional property
}

function greet(person: Person) {
  return "Hello, " + person.firstName + " " + person.lastName;
}
```

### Functions

```ts
function add(x: number, y: number): number {
  return x + y;
}

let myAdd = function (x: number, y: number): number {
  return x + y;
};

let myArrowAdd = (x: number, y: number): number => x + y;

function buildName(firstName: string, lastName = "Smith") {
  return firstName + " " + lastName;
}

function buildFullName(firstName: string, ...restOfName: string[]) {
  return firstName + " " + restOfName.join(" ");
}
```

### Classes

```ts
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return "Hello, " + this.greeting;
  }
}

let greeter = new Greeter("world");
```

### Inheritance

```ts
class Animal {
  move(distance: number = 0) {
    console.log(`Animal moved ${distance} meters.`);
  }
}

class Dog extends Animal {
  bark() {
    console.log("Woof! Woof!");
  }
}

const dog = new Dog();
dog.bark();
dog.move(10);
dog.bark();
```

### Generics

```ts
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("myString");
let output2 = identity<number>(42);
```

### Type Assertions

```ts
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;
// or
let strLength2: number = (someValue as string).length;
```

## Modules

### Export

```ts
export interface StringValidator {
  isAcceptable(s: string): boolean;
}

export class ZipCodeValidator implements StringValidator {
  isAcceptable(s: string) {
    return s.length === 5;
  }
}
```

### Import

```ts
import { ZipCodeValidator } from "./ZipCodeValidator";

let myValidator = new ZipCodeValidator();
```

### Namespaces

```ts
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }

  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return /^[A-Za-z]+$/.test(s);
    }
  }
}

let validator = new Validation.LettersOnlyValidator();
```

## Union and Intersection Types

### Union Types

```ts
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  if (typeof padding === "string") {
    return padding + value;
  }
  throw new Error(`Expected string or number, got '${padding}'.`);
}
```

### Intersection Types

```ts
interface ErrorHandling {
  success: boolean;
  error?: { message: string };
}

interface ArtworksData {
  artworks: { title: string }[];
}

type ArtworksResponse = ArtworksData & ErrorHandling;

const response: ArtworksResponse = {
  success: true,
  artworks: [{ title: "Mona Lisa" }],
};
```

## Utility Types

### Partial

```ts
interface User {
  id: number;
  name: string;
  age: number;
}

let partialUser: Partial<User> = {
  name: "Alice",
};
```

### Readonly

```ts
let readonlyUser: Readonly<User> = {
  id: 1,
  name: "Bob",
  age: 25,
};

// readonlyUser.age = 26; // Error: cannot reassign a readonly property
```

### Pick

```ts
type UserName = Pick<User, "name">;

let userName: UserName = {
  name: "Charlie",
};
```

### Omit

```ts
type UserWithoutAge = Omit<User, "age">;

let userWithoutAge: UserWithoutAge = {
  id: 2,
  name: "Dave",
};
```

### Record
在 TypeScript 中，`Record<string, string>` 是一个**工具类型（Utility Type）**，用于构造一个对象类型，其**所有键（key）都是字符串类型**，且**所有值（value）也都是字符串类型**。
### 语法
```typescript
Record<Keys, Type>
```
- `Keys`：对象的键类型（通常是 `string`、`number` 或字面量联合类型）。
- `Type`：对象的值类型。
```typescript
const user: Record<string, string> = {
  name: "Alice",
  email: "alice@example.com",
  role: "admin",
};
```
- 合法：所有键和值都是字符串。
- 非法：如果值不是字符串（如 `age: 30`），会报错。
## Decorators

### Class Decorator

```ts
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

### Method Decorator

```ts
function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}

class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}
```
