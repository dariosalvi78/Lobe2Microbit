Lobe to MicroBit
================

Dead simple example of integration between the image recongition sowtware [Lobe](https://www.lobe.ai/) and [Microbit](https://microbit.org/).
It's a webpage that loads a model produced by Lobe and sends recognised labels to a serial interface, which can be plugged to a Microbit, but also any other device really.

## Why?

Why not?

The idea is to test possible integrations of Machine Learning with embedded devices, such as Arduino and Microbit.

## How?

1. Train a model with Lobe.
2. Export your model as a Tensorflow.JS example.
3. Copy the content of the folder that you have just exported into the `model` folder.
4. Serve the webpage with a local web server, such as the [Live sever](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) of VSCode or [any other really](https://medium.com/swlh/need-a-local-static-server-here-are-several-options-bbbe77e59a11).
5. Prepare code for Microbit (or other board), you can use this as a template: https://makecode.microbit.org/_LY7X6F8UiV4x The example code uses two labels, "banana" and "apple", and shows a different icon (🍌 or 🍎) depending on which one has been recognised. Change it according to your labels and idea.
6. Open the webpage in Chrome, give it access to your camera, connect it to Microbit and have fun.
7. You can change the rate at which events are sent to Microbit and put a threshold under which labels are not sent.

## Who?

Developed by Dario Salvi, with the help of [Jens Pedersen](https://github.com/ixd-teaching/), for the [Master in Interaction Design of Malmo University](https://mau.se/en/study-education/programme/taind/).

Use this as a starter project:

