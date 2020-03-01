# ESPEnvMonitor

## Broadcast Data
  ### Data packet
  |0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|
  |:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
  |Hour|Min|Sec|Temp_Raw[DCU]|Temp_Raw[DCL]|Temp_CPU[DCU]|Temp_CPU[DCL]|Hum[DCU]|Hum[DCL]|Pre[DCU][U]|Pre[DCU][M]|Pre[DCU][L]|Pre[CUL][L]|Reserve|Reserve|Reserve|Reserve|Data Amount[U]|Data Amount[L]|[STATUS1](#h1)|

  * 0b10101001: [U] -> 0b1010
  * 0b10101001: [L] -> 0b1001
  * 24.65: [DCU] -> 24
  * 24.65: [DCL] -> 65

  ## <div id=h1>STATUS1</div>
  |7|6|5|4|3|2|1|0|
  |:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
  |Sensor State|RTC State|||||||
  