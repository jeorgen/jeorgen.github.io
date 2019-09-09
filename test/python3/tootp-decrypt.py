#!/usr/bin/env python
# coding: utf-8

import binascii
import scrypt
from Cryptodome.Cipher import ChaCha20
import json
import base64
import argparse

DOC = ''' This program decrypts a backup file from tootp.


Usage: 

    %s --password <password> <filename>
          
''' % (__file__,)

parser = argparse.ArgumentParser(description=DOC)
parser.add_argument("--password", action="store", dest="PASSWORD",help="Password to stretch")
parser.add_argument('file_name',nargs="?", default=None)

args = parser.parse_args()

def stretch(password, logN, nonce, r, p, buflen):
	stretched = binascii.hexlify(scrypt.hash(password.encode('utf-8'), nonce, N=2**int(logN), r=r, p=p, buflen=buflen))
	return stretched

def decrypt(key, hexnonce, cryptotext):
	secret = binascii.unhexlify(key)
	nonce = binascii.unhexlify(hexnonce)
	cipher = ChaCha20.new(key=secret, nonce=nonce)
	decoded = cipher.decrypt(cryptotext)
	return decoded

def decryptfile(file_name, password):
	fo = open(args.file_name)
	contents = json.load(fo)
	fo.close()
	stretchparams = contents['keyStretchFactor']
	stretched = stretch(args.PASSWORD,  logN=stretchparams['logN'], nonce=contents['nonce'], r=stretchparams['r'], p=stretchparams['p'], buflen=stretchparams['dkLen'])
	cryptotext = base64.b64decode(contents['cryptoText'])
	cleartext = decrypt(key=stretched, hexnonce = contents['nonce'], cryptotext = cryptotext)
	return cleartext

if __name__ == "__main__":
    if args.PASSWORD and args.file_name is not None:
    	cleartext = decryptfile(args.file_name, args.PASSWORD)
    	print (cleartext.decode('utf-8'))
    else:
    	print ("Not enough parameters")
    	print (DOC)

