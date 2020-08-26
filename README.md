# cocos2djs_decrypt
cocos2djs解密


用法：
frida -U -l hook_xxtea_decrypt.js -f packageName --no-pause



注意：先在sdcard目录下新建一个cocos2djs文件夹
解密后会在/sdcard/cocos2djs文件夹下生成.zip文件，解压后可得解密后的文件

