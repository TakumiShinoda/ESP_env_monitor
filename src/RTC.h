#ifndef RTC_H
#define RTC_H

#include <Arduino.h>
#include <ESP32Time.h>
#include "./parts/WifiConnection.h"

#define RTC_BEGIN_TIME

#define RTC_BEGIN_SUCCESS 0
#define RTC_BEGIN_FAILED_WIFI -1

class RTC{
  private:
    bool initialized = false;

  public:
    uint8_t begin(bool withConnection = false, char *ssid = (char *)"", char *pass = (char *)""){
      if(WiFi.status() == WL_CONNECTED){
        ESP32Time.begin();
        initialized = true;
        return RTC_BEGIN_SUCCESS;
      }else if(withConnection){
        if(!connectAP(ssid, pass)){
          initialized = false;
          return RTC_BEGIN_FAILED_WIFI;
        }else {
          ESP32Time.begin();
          initialized = true;
          return RTC_BEGIN_SUCCESS;
        }
      }else{
        initialized = false;
        return RTC_BEGIN_FAILED_WIFI;
      }
    }

    struct tm* now(){
      if(!initialized) return nullptr;
      time_t t = time(NULL);
      return localtime(&t);
    }
};

#endif