# frida_memory_patch_code
frida内存中修改字节码

## 使用：
支持多个参数
```patchCode("libil2cpp.so", 0x601560, "0100a0e3", "1EFF2FE1");```
```patchCode("libil2cpp.so", 0x601560, "0100a0e3", "0200a0e3","1EFF2FE1");```
