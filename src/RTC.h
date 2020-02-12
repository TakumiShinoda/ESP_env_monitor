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
      }else if(connectAP(ssid, pass)){
        ESP32Time.begin();
        initialized = true;
        return RTC_BEGIN_SUCCESS;
      }else{
        initialized = false;
        return RTC_BEGIN_FAILED_WIFI;
      }
    }

    bool now(struct tm *t_st){
      if(!initialized) return false;

      time_t t = time(NULL);

      t_st = localtime(&t);
      return true;
    }
};

#endif