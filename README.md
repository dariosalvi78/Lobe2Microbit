Lobe to MicroBit
================

Dead simple example of integration between the image recongition software [Lobe](https://www.lobe.ai/) and [Microbit](https://microbit.org/).

It's a webpage that loads a model produced by Lobe and sends recognised labels to a serial interface, which can be plugged to a Microbit or any other device (even an Arduino).

## Why?

Why not?

The idea is to test possible applications of Machine Learning with embedded devices, such as Microbit and Arduino.

## How?

1. Train a model with Lobe.
2. Export your model as a Tensorflow.JS example.
3. Copy the content of the folder that you have just exported into the `model` folder.
4. Serve the webpage with a local web server, such as the [Live sever](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VSCode or [any other really](https://medium.com/swlh/need-a-local-static-server-here-are-several-options-bbbe77e59a11).
5. Prepare code for Microbit (or other board). Events are sent as `label,confidence\n`. If you work with Microbit, you can use [this example code](https://makecode.microbit.org/_LY7X6F8UiV4x) which shows a different icon (🍌 or 🍎) depending on the label it receives ("banana" or "apple"). Change it according to your labels and idea.
6. Open the webpage in Chrome, give it access to your camera, connect it to Microbit and have fun.
7. You can change the rate at which events are sent to Microbit and put a threshold under which labels are not sent.

## Who?

Developed by Dario Salvi, with the help of [Jens Pedersen](https://github.com/ixd-teaching/), for the [Master in Interaction Design of Malmo University](https://mau.se/en/study-education/programme/taind/).
