# frida_memory_patch_code
frida内存中修改字节码

## 使用：
支持多个参数

arg[0]:so名称

arg[1]:偏移

arg[2]:指令，可以多个


```patchCode("libil2cpp.so", 0x601560, "20 00 80 52", "C0 03 5F D6");```

```patchCode("libil2cpp.so", 0x601560, "01 00 a0 e3", "02 00 a0 e3","1E FF 2F E1");```
