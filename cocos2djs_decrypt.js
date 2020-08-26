/*
用法：
frida -U -l hook_xxtea_decrypt.js -f packageName --no-pause

注意：先在sdcard目录下新建一个cocos2djs文件夹
解密后会在/sdcard/cocos2djs文件夹下生成.zip文件，解压后可得解密后的文件
*/



var is_can_hook = false;
var filesize = 0;

//soName 传入指定.so
//offset 解密函数偏移
function hook_xxtea_decrypt(soName,offset)
{
	Interceptor.attach(Module.findExportByName(null, "dlopen"),
	{
		onEnter: function (args)
		{
			var pathptr = args[0];
			if (pathptr !== undefined && pathptr != null)
			{
				var path = ptr(pathptr).readCString();
				//console.log("dlopen:", path);
				if (path.indexOf(soName) >= 0)
				{
					//找到指定.so后，在onLeave就可以hook到，而不是在onEnter里hook指定.so
					this.is_can_hook = true;
					console.log("\n"+soName+"_path:", path);

				}
			}
		},
		onLeave: function (retval)
		{
			if (this.is_can_hook)
			{
				var moduleBaseAddress = Module.getBaseAddress(soName);
				console.log(soName + "_address:", moduleBaseAddress);
				var nativePointer = moduleBaseAddress.add(offset);//加上偏移地址，hook指定函数
				Interceptor.attach(nativePointer,
				{
					onEnter: function (args)
					{
						console.log("==args[2]..filesize：" + args[1])
						console.log("==args[3]..key：" + Memory.readCString(args[2]))
						filesize = parseInt(args[1], 16);//保存文件大小

					},
					onLeave: function (retval)
					{
						var file = new File("/sdcard/cocos2djs/"+ filesize + ".zip", "wb");
						file.write(Memory.readByteArray(retval, filesize));
						file.flush();
						file.close();
					}
				}
				);
				console.log("dlopen finish...");
			}
		}
	}
	);

	Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"),
	{
		onEnter: function (args)
		{
			var pathptr = args[0];
			if (pathptr !== undefined && pathptr != null)
			{
				var path = ptr(pathptr).readCString();
				//console.log("android_dlopen_ext:", path);
				
				if (path.indexOf(soName) >= 0)
				{
					//找到指定.so后，在onLeave就可以hook到，而不是在onEnter里hook指定.so
					this.is_can_hook = true;
					console.log("\n"+soName+"_path:", path);
				}
			}
		},
		onLeave: function (retval)
		{
			if (this.is_can_hook)
			{
				var moduleBaseAddress = Module.getBaseAddress(soName);
				console.log(soName + "_address:", moduleBaseAddress);
				var nativePointer = moduleBaseAddress.add(offset);//加上偏移地址，hook指定函数
				Interceptor.attach(nativePointer,
				{
					onEnter: function (args)
					{
						console.log("==args[2]..filesize：" + args[1])
						console.log("==args[3]..key：" + Memory.readCString(args[2]))
						filesize = parseInt(args[1], 16);//保存文件大小

					},
					onLeave: function (retval)
					{
						var file = new File("/sdcard/cocos2djs/"+ filesize + ".zip", "wb");
						file.write(Memory.readByteArray(retval, filesize));
						file.flush();
						file.close();
					}
				}
				);
				console.log("android_dlopen_ext  finish...");
			}
			
		}
	}
	);
}


setImmediate(hook_dlopen("libcocos2djs.so","0x6EE6A8"));