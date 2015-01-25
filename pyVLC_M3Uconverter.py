#! /usr/bin/python
# -*- coding: utf-8 -*-

#shebang-lines
#! /usr/bin/python
#! python2
#! python3
# see 
# https://docs.python.org/3/using/windows.html#python-launcher-for-windows
# https://docs.python.org/3/using/windows.html#shebang-lines

"""
    quick script to batch convert songs listed in an m3u playlist to ogg or mp3
    (see usage)
    
    tested on windows7
    
    history:
        31.12.2014 20:30 s-light: created.
        01.01.2015 02:26 s-light: vlc commandline transcoding works.
        01.01.2015 03:40 s-light: add m3u8 reading. utf-8 bug.. switch to use python3
        01.01.2015 11:45 s-light: get back to work. (fix m3u8 reading.
        01.01.2015 13:30 s-light: changed output path to script path.
        01.01.2015 13:30 s-light: working.
        01.01.2015 14:08 s-light: added sub directory creation.
        
        
    todo:
        ~
"""

version = """01.01.2015 14:08 s-light"""

import sys
print('***************\nPython Version: ' + sys.version + '\n***************\n')

import os
import subprocess

# import vlc

print(__doc__)

################################################################

#########################################
# Options
#########################################

format = "OGG"
# format = "MP3"

formats = {
        'OGG': {
            'acodec': 'vorb',
            'ab':     128,
            'channels': 2,
            'samplerate': 44100,
            'mux': 'ogg',
            'extension': 'ogg',
        },
        'MP3': {
            'acodec': 'mp3',
            'ab':     128,
            'channels': 2,
            'samplerate': 44100,
            'mux': 'raw',
            'extension': 'mp3',
        }
    }

################################################################

def parseM3U(source_playlist_file):
    filelist = []
    
    # open playlist for reading
    f = open(source_playlist_file, 'r', encoding="utf-8")
    # for each line check if it is a path
    for line in f:
        # print("line: '{}'".format(line))
        # check for comment
        if not line.startswith('#'):
            # print("line: '{}'".format(line.encode(encoding="utf-8")))
            # print("line: '{}'".format(line))
            filename = os.path.abspath(line.strip())
            #print("filename: '{}'".format(filename))
            if os.path.isfile(filename):
                #print("isfile = true; so add to list.")
                filelist.append(filename)
            #
        #
    #
    
    return filelist
#

def vlcTranscodeFile(source_File, target_Path, format_options):
    """
    transcode with the VLC commandline.
    based on 
        https://wiki.videolan.org/Streaming/#Transcoding_commandline_string_structure
        https://wiki.videolan.org/Transcode/#Completely_non-interactive_transcoding
        https://wiki.videolan.org/How_to_Batch_Encode/#Command_Lines
        
        https://wiki.videolan.org/Documentation:Advanced_Use_of_VLC/#Use_the_command_line
        --> Note: Windows users have to use the --option-name="value" syntax instead of the --option-name value syntax.
        
        http://stackoverflow.com/questions/10249261/play-video-file-with-vlc-then-quit-vlc/26943271#26943271
        http://stackoverflow.com/questions/6182094/executing-a-subprocess-from-python
        
        
        commandline
        vlc --sout "#transcode{[TRANSCODE_OPTIONS]}:std{[OUTPUT_OPTIONS]}" INPUT
        example:
        vlc --sout "#transcode{acodec=mp3,ab=128,channels=2,samplerate=44100}:std{access=file,mux=raw,dst=OUTPUT}" INPUT
        
        test:
        vlc --sout "#transcode{acodec=mp3,ab=128,channels=2,samplerate=44100}:std{access=file,mux=raw,dst=c:\_Local_DATA\_audio\flac_music\Cris_Cosmo__Test_MP3\test.mp3}" c:\_Local_DATA\_audio\flac_music\Cris_Cosmo__Test_MP3\test.flac
        vlc --sout "#transcode{acodec=mp3,ab=128,channels=2,samplerate=44100}:std{access=file,mux=raw,dst=c:\_Local_DATA\temp\test.mp3}" c:\_Local_DATA\temp\test.flac
    """
    
    # print("vlcTranscodeFile: ")
    
    # print('source_File: "{}"'.format(source_File))
    
    # get filename without extension
    target_Filename = os.path.basename(source_File)
    # print('target_Filename: "{}"'.format(target_Filename))
    target_Filename = os.path.splitext(target_Filename)[0] + '.' + format_options['extension']
    # print('target_Filename: "{}"'.format(target_Filename))
    
    # get source Path
    source_Path = os.path.split(source_File)[0]
    # print('source_Path: "{}"'.format(source_Path))
    #get last directory for filename
    subDir = os.path.split(source_Path)[1]
    # print('subDir: "{}"'.format(subDir))
    
    target_Path_new = os.path.join(target_Path, subDir)
    print('target_Path_new: "{}"'.format(target_Path_new))
    
    # check if path exists
    if not os.path.exists(target_Path_new):
        # make path
        os.makedirs(target_Path_new)
    
    target_File = os.path.join(target_Path_new, target_Filename)
    print('target_File: "{}"'.format(target_File))
    
    
    transcode_options_string = 'acodec={},ab={},channels={},samplerate={}'.format(
        format_options['acodec'], 
        format_options['ab'], 
        format_options['channels'], 
        format_options['samplerate']
        )
    output_options_string = 'access=file,mux={},dst=\'{}\''.format(
        format_options['mux'],
        target_File
        )
    
    # print('transcode_options_string: "{}"'.format(transcode_options_string))
    # print('output_options_string: "{}"'.format(output_options_string))
    
    transcode_string = '--sout=#transcode{' + transcode_options_string + '}:std{' + output_options_string + '} '
    # print('transcode_string: "{}"'.format(transcode_string))
    
    app_path = 'c:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe'
    
    # print('app_path: "{}"'.format(app_path))
    print('\tstart vlc transcoding...')
    # convert current file
    pid = subprocess.call([
        app_path,
        "-vvv", #debug level
        "-I dummy", # deactivate user interface
        transcode_string,
        source_File,
        'vlc://quit' # quite vlc after conversion
        ])

    # working example:
    # pid = subprocess.call([
        # app_path, 
        # "-vvv", #debug level
        # "--sout=#transcode{acodec=mp3,ab=128,channels=2,samplerate=44100}:std{access=file,mux=raw,dst=c:\\_Local_DATA\\temp\\test.mp3}",
        # 'c:\\_Local_DATA\\temp\\test.flac'
        # ])
        
    print('\tfinished.')
#

################################################################


if __name__ == '__main__':
    
    if sys.version_info[0] > 2:
        
        source_Filename = ""
        ## parse arguments
        call_path = os.path.abspath(os.path.dirname(sys.argv[0]))
        # ony use args after script name
        arg = sys.argv[1:]
        if not arg:
            print("please specify source M3U8 Playlist File!")
            print(" Allowed parameters:")
            print("   source m3u8 file   ('*.m3u' | '*.m3u8')")
            print("   format 'MP3' | 'OGG'    (defualt='OGG')")
            print("")
        else:
            source_Filename = arg[0]
            if len(arg) > 1:
                format = arg[1]
            
            # do it :-) 
            #
            
            print('source_Filename: "{}"'.format(source_Filename))
            
            # read Playlist
            filelist = parseM3U(source_Filename)
            
            # convert
            for file in filelist:
                print('convert file: {}'.format(file))
                vlcTranscodeFile(file, call_path, formats[format] )
        #
    else:
        print("please use python 3")
    #
    print("program end.")
#