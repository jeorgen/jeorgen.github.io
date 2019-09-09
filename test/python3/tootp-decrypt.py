#!/usr/bin/env python
# coding: utf-8

import binascii
import scrypt
from Cryptodome.Cipher import ChaCha20
import json
import base64
import hashlib


DOC = ''' This program decrypts a backup file from tootp.


Usage: 

    %s --password <password> <filename>

    
Alternatively, you can also make it stretch a password with the following arguments:

     %s --password <password>  --salt <salt in hex format> [--logN <default is 16> --r <default is 8> --p <default is 1> --buflen <default is 32>]
     
It will return a hex string with twice the number of characters as bufLen (since one hex character is 4 bits)
     
     
''' % (__file__, __file__)


import argparse
parser = argparse.ArgumentParser(description=DOC)
parser.add_argument("--password", action="store", dest="PASSWORD",help="Password to stretch")
parser.add_argument("--salt", action="store", dest="SALT",help="Salt, should be in hex encoding")
parser.add_argument("--logN", action="store", dest="LOGN",default = 16, help="Number of rounds, typically from 8 to 20.Max seems to be 22. Higher takes longer and may exhaust your RAM")
parser.add_argument("--r", action="store", dest="R",default = 8, help="r value, default is 8.")
parser.add_argument("--p", action="store", dest="P",default = 1, help="Optimise for these number of parallel computations. 1 is typically fine as a value here.")

parser.add_argument("--buflen", action="store", dest="BUFLEN",default = 32, help="Length of stretched password. Default is 32. Go with at least 32, preferrably more.")
parser.add_argument('file_name',nargs="?", default=None)


args = parser.parse_args()

def _stretch(password, logN, nonce, r, p, buflen):
	stretched = binascii.hexlify(scrypt.hash(password.encode('utf-8'), nonce, N=2**int(logN), r=r, p=p, buflen=buflen))
	return stretched

def stretch(contents, password):
	print (password)
	params = contents['keyStretchFactor']
	stretched = binascii.hexlify(scrypt.hash(password.encode('utf-8'), contents['nonce'], N=2**int(params['logN']), r=args.R, p=args.P, buflen=args.BUFLEN))
	print("Stretched: " + stretched)
	return stretched
 
def decrypt_JSON(cryptotext, password, nonce):
	secret = binascii.unhexlify(password)
	msg_nonce = binascii.unhexlify(nonce)
	cipher = ChaCha20.new(key=secret, nonce=msg_nonce)
	return cipher.decrypt(cryptotext)

def decrypt(key, hexnonce, cryptotext):
	secret = binascii.unhexlify(key)
	nonce = binascii.unhexlify(hexnonce)
	cipher = ChaCha20.new(key=secret, nonce=nonce)
	# return base64.b64encode(pysodium.crypto_aead_chacha20poly1305_ietf_encrypt(plainText, None, nonce, secret))
	decoded = cipher.decrypt(cryptotext)
	return decoded

def decryptfile(file_name, password):
	fo = open(args.file_name)
	contents = json.load(fo)
	fo.close()
	stretchparams = contents['keyStretchFactor']
	stretched = _stretch(args.PASSWORD,  logN=stretchparams['logN'], nonce=contents['nonce'], r=stretchparams['r'], p=stretchparams['p'], buflen=stretchparams['dkLen'])
	cryptotext = base64.b64decode(contents['cryptoText'])
	cleartext = decrypt(key=stretched, hexnonce = contents['nonce'], cryptotext = cryptotext)
	return cleartext

if __name__ == "__main__":
    if args.PASSWORD and args.file_name is not None:
    	cleartext = decryptfile(args.file_name, args.PASSWORD)
    	print (cleartext.decode('utf-8'))
    elif args.PASSWORD and args.SALT:
    	# pass
        print(_stretch(args.PASSWORD,  logN=args.LOGN, nonce=args.SALT, r=args.R, p=args.P, buflen=args.BUFLEN) )
    else:
    	print ("Not enough parameters")
    	print (DOC)

