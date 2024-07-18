# Styleguide

Styleguide uses JavaScript similar dock-blocks to create a nice looking documentation of your work. It's main purpose is to combine the task of documentation with testing.

## Why?

- Improve and Speed up development of new components
- Document as close as possible
- Give other developers an idea what exists and how it is used
- Use similar syntax for documentations like you would in JavaScript

Often I see people struggle with CSS and I think that's because of the following reasons:

1. They think to big and want to do Style, Functionality and other stuff in on go. This leads to jumping back and forth between stuff. Imagine you have a CMS and you should create a new content element. There are lot's of ways how you can do the job. Often you start creating the generation into your CMS, you log in create the element on the page where it later should be then you visit that page and start applying the required styles to that element. The problem is often you need to change the HTML-Markup, change/add a CSS class or something else. So you go back to the component generation apply the changes there, go into the CMS update your element, visit the page again only to notice you have forgotten something else.
2. They are lost in the project because of several reasons, the project had grown over the years, lot's of people have worked on the project or something else. You may know the pain. For example if you need to apply a small change to a component you mostly end up doing the change on the component on that specific page where the change should take place. But what you may have not seed that specific component was reused on a other page and you accidentally break that other component you hav not know about.

## Solution

Working with the documentation. This means while documenting and giving examples of your code, you can see the result.

- Design first approach
- Document what you have done
- Give an overview what exists and how it can be used
- Prevent css class name collision
- encapsulated testing of components

## How to use?
