#ifndef Utils_h
#define Utils_h

#include <Arduino.h>
#include <array>
#include <vector>
#include <regex>
#include <string>
#include "ChainArray.h"

class StatusGen{
  private:
    ChainArray States;

  public:
    void addStatus(int8_t code, String mes);
    void removeStatus(int8_t code);
    String getMes(int8_t code);
    String getArranged(int8_t code, String sep);
};

class Utils{
  public:
    ChainArray analyzeGetRequest(String request);
    String split(String target, char sep, uint8_t index);
    std::vector<String> split2vector(String target, char sep);
    ChainArray analyzeQuery(String str);
    std::vector<uint8_t> vector_find(std::vector<String> target, String str);
    String ints2utf8(std::vector<uint8_t> data);
    String fixPath(String path);
    bool checkFormat(std::string target, char c, std::vector<bool> rule);
    String decodeUrl(String input);
    void slideRightBuff(float buff[], uint16_t size);
    void charArrToUint8_tArr(char *str, uint8_t *buff, uint16_t length);
    String stdString2String(std::string str);
};

#endif