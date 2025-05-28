---
layout: post
title: "Top 6 most commonly used Server Type"
date: 2021-07-30 22:33
comments: true
tag: 
- springboot
- java
- swagger
- springfox
image: "https://progressivecoder.com/wp-content/uploads/2019/03/spring-boot.png"
headerImage: true
projects: false
category: blog
author: lt
externalLink: http://dolszewski.com/spring/how-to-bind-requestparam-to-object/
---

Do you have multiple parameters annotated with _@RequestParam_ in a request mapping method and feel it isn’t readable?

The annotation looks pretty straightforward when there’s one or two input parameters expected in a request but when the list gets longer you might feel overwhelmed.

You cannot use the _@RequestParam_ annotation inside objects but it doesn’t mean you’re left with no other solution. In this post, I’m going to show you **how to bind multiple request parameters to an object in Spring application**.

## Too long list of @RequestParams

No matter it’s a controller or another class I believe you agree that **a long list of method parameters is hard to read**. In addition, if parameter types are the same, it’s easier to make a mistake.

Static code analysis tools like [Checkstyle can detect numerous inputs in methods](http://checkstyle.sourceforge.net/config_sizes.html#ParameterNumber) because it’s widely considered as a bad practice.

It’s very common that you pass a group of parameters together to different layers of your application. Such group usually can **form an object** and all you have to do is to **extract it and give it a proper name**.

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

Three parameters isn’t a concerning number but it can easily grow. For instance, searching usually includes a sort order or some additional filters. In this case, they are all passed to the data access layer so they seem to be perfect candidates for [parameter object](https://refactoring.com/catalog/introduceParameterObject.html) extraction.

## Binding @RequestParam to object

From my experience, developers don’t replace long lists of _@RequestParams_ because they simply aren’t aware it’s possible. The documentation of _@RequestParam_ doesn’t mention the alternative solution.

Start with updating controller’s method to accept a POJO as the input instead of the list of parameters.

```java
@GetMapping
List<Product> searchProducts(ProductCriteria productCriteria) {
   return productRepository.search(productCriteria);
}
```

The POJO doesn’t require any additional annotations. It should have a list of fields which match with request parameters that will be bound from the HTTP request, standard getters/setters, and a no-argument constructor.

```java
 class ProductCriteria {

   private String query;
   private int offset;
   private int limit;

   ProductCriteria() {
   }

   public String getQuery() {
       return query;
   }

   public void setQuery(String query) {
       this.query = query;
   }

   // other getters/setters

}
```

### Validating request parameters inside POJO

Alright, but we don’t use the _@RequestParam_ annotation only to bind HTTP parameters. Another useful feature of the annotation is the possibility to mark a given parameter as required. If the parameter is missing in a request, our endpoint can reject it.

To achieve the same effect (and even much more!) with a POJO we may **use bean validation**. Java comes with numerous built-in contraints but you always [create a custom validation](http://dolszewski.com/spring/custom-validation-annotation-in-spring/) if needed.

Let’s return to our POJO and add some validation rules to fields. If you just want to **mimic the behavior of** **_@RequestParam(required = false)_**, all you need is the **_@NotNull_** **annotation on a required field**.

In many cases, it makes much more sense to use _@NotBlack_ instead _@NotNull_ as it also covers the undesired empty string problem (a string with the length of zero).
 
 ```java
final class ProductCriteria {

   @NotBlank
   private String query;
   @Min(0)
   private int offset;
   @Min(1)
   private int limi;

   // ...

}
```

A word of caution:

**Adding validation annotations of fields isn’t enough to make it work.**

You also need to mark the POJO parameter in controller’s method with the _@Valid_ annotation. This way you inform Spring that it should execute validation on the binding step.

```java
@GetMapping
List<Product> searchProducts(@Valid ProductCriteria productCriteria) {
   // ...
}
```

### Default request parameter values inside POJO

Another useful feature of the _@RequestParam_ annotation is the ability to define the default value when the parameter isn’t present it the HTTP request.

When we have a POJO no special magic is needed. You just assign the default value directly to a field. When the parameter is missing in the request, nothing will override the predefined value.

```java
 private int offset = 0;
private int limit = 10;
```

## Multiple objects

You aren’t forced to put all HTTP parameters inside a single object. You can group parameters in several POJOs.

To illustrate that, let’s add sort criteria to our endpoint. First, we need a separate object. Just like before it has some validation constraints.

```java
 final class SortCriteria {

   @NotNull
   private SortOrder order;
   @NotBlank
   private String sortAttribute;

   // constructor, getters/setters

}
```

In the controller, you just add it as a separate input parameter. Note that the _@Valid_ annotation is required on each parameter which should be validated.

```java
 @GetMapping
List<Product> searchProducts(@Valid ProductCriteria productCriteria, @Valid SortCriteria sortCriteria) {
   // ...
}
```

## Nested objects

As an alternative to multiple input request objects we can also use composition. Parameter binding also works with nested objects.

Below you can find an example in which the previously introduced sort criteria was moved to the product criteria POJO.

To verify all nested properties, you should add the _@Valid_ annotation to the field. Be aware that if the field is null Spring won’t validate its properties. That might be the desired solution if all nested properties are optional. If not, just put the _@NotNull_ annotation on that nested object field.

```java
 final class ProductCriteria {

   @NotNull
   @Valid
   private SortCriteria sort;

   // ...

}
```

HTTP parameters must match field names using the dot notation. In our case they should look as follows:

```
 sort.order=ASC&sort.attribute=name
 ```

## Immutable DTO

Nowadays, you can observe a tendency in going away from traditional POJOs with setters in favor of immutable objects.

Immutable objects have several benefits (and downsides as well … but shh). In my opinion, the biggest one is **simpler maintenance**.

Have you ever been tracking through dozens of layers of your application to understand what conditions lead to a particular state of an object? In which place this or that field changed? Why is it updated? The name of a setter method doesn’t explain anything. Setters have no meaning.

Considering the fact when Spring framework was created, no one should be surprised that Spring strongly relies on POJO specification. Yet, times changed and old patterns became antipatterns.

There’s no easy way to magically bind HTTP arguments to a POJO using a parameterized constructor. The non-argument constructor is inevitable. However, we can make that constructor _private_ (but sadly not in nested objects) and removed all setters. From the public perspective, the object will become immutable.

By default, Spring requires setter methods to bind HTTP parameters to fields. Fortunately, it’s possible to reconfigure the binder and use direct field access (via reflection).

In order to configure the data binder globally for your whole application, you can create a controller advice component. You can alter the binder configuration inside a method annotated with the _@InitBinder_ annotation which accepts the binder as an input.

```java
 @ControllerAdvice
class BindingControllerAdvice {

   @InitBinder
   public void initBinder(WebDataBinder binder) {
       binder.initDirectFieldAccess();
   }

}
```

After creating that small class we can return to our POJO and remove all setter methods from the class to make it read-only for the public use.

```java
 final class ProductCriteria {

   @NotBlank
   private String query;
   @Min(0)
   private int offset = 0;
   @Min(1)
   private int limit = 10;

   private ProductCriteria() {
   }

   public String getQuery() {
       return query;
   }

   public int getOffset() {
       return offset;
   }

   public int getLimit() {
       return limit;
   }

}
```

Restart your application and play around with the parameters of the HTTP request. It should work as before.

## Conclusion

In this article, you could see that HTTP request parameters bound in Spring MVC controllers using _@RequestParam_ can be easily replaced with a parameter object which groups several attributes and is nothing more than a simple POJO or optionally an immutable DTO.
