#!/usr/bin/env python
# coding=utf-8

"""
strobe generator.

    test to generate a frame-stobe for ola

    based on:
        https://www.openlighting.org/ola/developer-documentation/python-api/#Sending_Multiple_Frames

    history:
        29.05.2015 11:40 stefan: started.
        13.06.2015 14:22 stefan: added pixel_count argument
        22.08.2015 18:40 stefan: added exception handling.

    todo:
        ~ all fine :-)
"""


import sys
import time
import array
import socket
from ola.ClientWrapper import ClientWrapper
from ola.OlaClient import OLADNotRunningException

version = """22.08.2015 18:40 stefan"""

print(42*'*')
print('Python Version: ' + sys.version)
print(42*'*')
print(__doc__)
print(42*'*')

################################################################

wrapper = None
client = None

universe = -1
global_universe_list = []

pixel_count = 25
TICK_INTERVAL = 10  # in ms

strobe_state = True


def DmxSent(state):
    """react on ola state."""
    if not state.Succeeded():
        wrapper.Stop()
        # print("warning: dmxSent does not Succeeded.")


def SendDMXFrame():
    """send one dmx frame (on multiple universes)."""
    # if wrapper.Client():

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
    try:
        if universe == -1:
            # send to universe list
            for uni in global_universe_list:
                wrapper.Client().SendDmx(uni, data, DmxSent)
        else:
            # send
            wrapper.Client().SendDmx(universe, data, DmxSent)
    except OLADNotRunningException:
        wrapper.Stop()
        print("olad not running anymore.")

    # invert
    if strobe_state:
        strobe_state = False
    else:
        strobe_state = True

    # else:
    #     wrapper.Stop()
    #     print("olad not running anymore.")


def get_unused_universes(state, universe_list):
    """fill global_universe_list with unused universes."""
    print("fill_universe_list:")
    print("state {}".format(state))
    print("universe_list {}".format(universe_list))
    global global_universe_list
    for universe in universe_list:
        # check if this universe has no input_port patched.
        if len(universe.input_ports) == 0:
            # if no input_port than add it to list.
            print("u{} input_ports: {}".format(
                universe.id,
                universe.input_ports
            ))
            global_universe_list.append(universe.id)


################################################################
if __name__ == '__main__':
    # parse arguments
    # ony use args after script name
    arg = sys.argv[1:]
    if not arg:
        print("using standard values.")
        print(" Allowed parameters:")
        print("   TICK_INTERVAL in ms       (defualt=10)")
        print("   pixel_count               (defualt=170)")
        print("   universe                  (defualt=-1 = automatic)")
        print("")
    else:
        TICK_INTERVAL = float(arg[0])
        if len(arg) > 1:
            pixel_count = int(arg[1])
        if len(arg) > 2:
            universe = int(arg[2])
    # print parsed argument values
    print('''values:
        TICK_INTERVAL :{:>6}
        pixel_count   :{:>6}
        universe      :{:>6}
    '''.format(TICK_INTERVAL, pixel_count, universe))

    # setup system
    print("waiting for olad....")
    flag_connected = False
    try:
        while not flag_connected:
            try:
                # print("get wrapper")
                wrapper = ClientWrapper()
            except OLADNotRunningException:
                time.sleep(0.5)
            else:
                flag_connected = True
    except KeyboardInterrupt:
        print("\nstopped waiting for olad.")
    else:
        print("get client")
        client = wrapper.Client()
        if universe == -1:
            print("request universes")
            print(client.FetchUniverses(get_unused_universes))
        print("add event to a SendDMXFrame")
        wrapper.AddEvent(TICK_INTERVAL, SendDMXFrame)

        print("run")
        try:
            wrapper.Run()
        except KeyboardInterrupt:
            wrapper.Stop()
            print("\nstopped")
        except socket.error as error:
            print("connection to OLAD lost:")
            print("   error: " + error.__str__())
        # except Exception as error:
        #     print(error)
