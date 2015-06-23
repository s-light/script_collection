#!/usr/bin/env python
# coding=utf-8


# see https://docs.python.org/3/using/windows.html#python-launcher-for-windows

"""strobe
    test to generate a frame-stobe for ola

    based on: https://www.openlighting.org/ola/developer-documentation/python-api/#Sending_Multiple_Frames

    history:
        29.05.2015 11:40 stefan: started.
        13.06.2015 14:22 stefan: added pixel_count argument

    todo:
        ~ all fine :-)
"""
version = """13.06.2015 14:22 stefan"""

import sys
print('***************\nPython Version: ' + sys.version + '\n***************\n')

print(__doc__)


import sys
import array
from ola.ClientWrapper import ClientWrapper

################################################################

universe = 5
wrapper = None
pixel_count = 25
strobe_state = True
TICK_INTERVAL = 10  # in ms

def DmxSent(state):
    if not state.Succeeded():
        wrapper.Stop()
        # print("warning: dmxSent does not Succeeded.")

def SendDMXFrame():
    # schdule a function call in 100ms
    # we do this first in case the frame computation takes a long time.
    wrapper.AddEvent(TICK_INTERVAL, SendDMXFrame)

    # compute frame here
    data = array.array('B')
    global pixel_count
    global strobe_state

    for index_pixel in range(1, pixel_count+1):
        if strobe_state:
            data.append(0)
            data.append(250)
            data.append(0)
        else:
            data.append(0)
            data.append(0)
            data.append(0)
    # send
    wrapper.Client().SendDmx(universe, data, DmxSent)

    # invert
    if strobe_state:
        strobe_state = False
    else:
        strobe_state = True


################################################################
if __name__ == '__main__':
    ## parse arguments
    # ony use args after script name
    arg = sys.argv[1:]
    if not arg:
        print( "using standard values.")
        print(" Allowed parameters:")
        print("   TICK_INTERVAL in ms       (defualt=10)")
        print("   pixel_count               (defualt=25)")
        print("   universe                  (defualt=5)")
        print("")
    else:
        TICK_INTERVAL = float(arg[0])
        if len(arg) > 1:
            pixel_count = int(arg[1])
        if len(arg) > 2:
            universe = int(arg[2])
    #print parsed argument values
    print('''values:
        TICK_INTERVAL :{:>6}
        pixel_count   :{:>6}
        universe      :{:>6}
    '''.format(TICK_INTERVAL, pixel_count, universe))

    # setup system
    print("get wrapper")
    wrapper = ClientWrapper()
    print("add event")
    wrapper.AddEvent(TICK_INTERVAL, SendDMXFrame)
    print("run")
    wrapper.Run()
