---
layout: post
title: "How to bind @RequestParam to POJO in Spring"
date: 2012-05-08 22:33
comments: true
tag: 
- springboot
- java
- swagger
- springfox
image: "{{ site.url }}/assets/images/ibdML-poster.png"
headerImage: true
projects: false
category: blog
author: lt
externalLink: false
---

Do you have multiple parameters annotated with @RequestParam in a request mapping method and feel it isn’t readable?

The annotation looks pretty straightforward when there’s one or two input parameters expected in a request but when the list gets longer you might feel overwhelmed.

You cannot use the @RequestParam annotation inside objects but it doesn’t mean you’re left with no other solution. In this post, I’m going to show you **how to bind multiple request parameters to an object in Spring application.**

## Too long list of @RequestParams

No matter it’s a controller or another class I believe you agree that a long list of method parameters is hard to read. In addition, if parameter types are the same, it’s easier to make a mistake.

Static code analysis tools like Checkstyle can detect numerous inputs in methods because it’s widely considered as a bad practice.

It’s very common that you pass a group of parameters together to different layers of your application. Such group usually can form an object and all you have to do is to extract it and give it a proper name.

Let’s take a look at a sample GET endpoint used to search for some products:

```java

@RestController
@RequestMapping("/products")
class ProductController {
 
   //...
 
   @GetMapping
   List<Product> searchProducts(@RequestParam String query,
                                @RequestParam(required = false, defaultValue = "0") int offset,
                                @RequestParam(required = false, defaultValue = "10") int limit) {
       return productRepository.search(query, offset, limit);
   }
 
}

```


Three parameters isn’t a concerning number but it can easily grow. For instance, searching usually includes a sort order or some additional filters. In this case, they are all passed to the data access layer so they seem to be perfect candidates for parameter object extraction


## Binding @RequestParam to object

From my experience, developers don’t replace long lists of **@RequestParams** because they simply aren’t aware it’s possible. The documentation of **@RequestParam** doesn’t mention the alternative solution.

Start with updating controller’s method to accept a POJO as the input instead of the list of parameters.