---
title: Getting Started with Rust
author: Ada Chen
date: 2025-03-14
tags: [rust, systems, beginner]
images:
  - https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80
  - https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80
---

# Getting Started with Rust

Rust has taken the systems programming world by storm, and for good reason. It offers **memory safety without a garbage collector**, blazing performance, and a compiler that acts like a meticulous senior engineer.

## Why Rust?

The ownership model is what sets Rust apart. Every value has exactly one owner, and when that owner goes out of scope, the value is dropped. No dangling pointers. No double-frees. No data races.

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // s1 is moved, no longer valid
    println!("{}", s2); // works fine
}
```

## The Borrow Checker

The borrow checker enforces rules at compile time:

- You can have **many immutable references** OR **one mutable reference** — never both.
- References must always be valid.

This eliminates entire classes of bugs that plague C and C++ codebases.

## Getting Started

Install Rust via `rustup`:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Then create your first project:

```bash
cargo new hello_world
cd hello_world
cargo run
```

## Conclusion

The initial learning curve is real, but the compiler's error messages are some of the best in any language. Treat the borrow checker as a teacher, not an enemy.
