---
layout: post
title: "Explain the JavaScript Event Loop"
date: 2021-07-30 22:33
comments: true
tag: 
- browser
- javascript
- architecture
image: 
headerImage: true
projects: false
category: blog
author: lt
externalLink: 
---

# Explain the JavaScript Event Loop

➤ Single-Threaded Execution:
JavaScript is single-threaded, which means it can only execute one task at a time. This is managed by the call stack, where functions are executed sequentially.

➤ Call Stack: Think of the call stack as a stack of plates. Every time a function is called, a new plate (function) is added to the stack. When the function finishes, the plate is removed from the stack.

➤ Web APIs: For asynchronous operations like `setTimeout`, DOM events, and HTTP requests, JavaScript relies on Web APIs provided by the browser. These operations are handled outside of the call stack.

➤ Callback Queue: When an asynchronous operation completes, its callback is placed in the callback queue. This queue waits until the call stack is clear before pushing the next callback onto the stack.

➤ Event Loop: The event loop is like a manager that constantly checks if the call stack is empty. When it is, the event loop takes the first callback from the callback queue and adds it to the call stack.

➤ Microtasks Queue: There's also a microtasks queue for tasks like promises. This queue has a higher priority than the callback queue. The event loop checks the microtasks queue first, ensuring these tasks are processed before other callbacks.

➤ Priority Handling: To sum it up, the event loop first checks the microtasks queue. If it's empty, it moves to the callback queue. This ensures that critical tasks, like promises, are handled promptly.

Restart your application and play around with the parameters of the HTTP request. It should work as before.

## Conclusion

In this article, you could see that HTTP request parameters bound in Spring MVC controllers using _@RequestParam_ can be easily replaced with a parameter object which groups several attributes and is nothing more than a simple POJO or optionally an immutable DTO.
