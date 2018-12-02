#!/bin/bash

./gradlew ${1:-installDevMinSdkDevKernelDebug} --stacktrace && adb shell am start -n net.food.confusion.confusion/host.exp.exponent.MainActivity
