# Arduino Data Logging
Advanced Topics in Web Programming 1501

### Overview
Using Xively, data.sparkfun.com or another similar service, you will need to collect 24 hours worth of environmental data using an Arduino and the Ethernet Shield. You will then create a web interface for displaying that data to users.

### Project
![Arduino Data Logger](http://res.cloudinary.com/hollyspringsteen/image/upload/v1422311577/20150126_155055_Richtone_HDR_xrqcwl.jpg "Arduino Data Logger")

#### [Project Page](https://demondesigner.github.io/atw/datalogging)

Using an ethernet shield, photoresistor, and a temperature sensor the Arduino was wired to record both temperature and light in its surroundings. The Arduino was hooked up for slightly over 24 hours recording data every 30 seconds. This data was stored on [data.sparkfun.com](https://data.sparkfun.com/streams/bGbzn6QJJgTmWYz1r82d) and accessed via json.

##### Project Code

``` cpp
/*
Light & Temperature Collection
Holly Springsteen
ATW1501
*/

#include <SPI.h>
#include <Ethernet.h>

// Enter a MAC address for your controller below.
// Newer Ethernet shields have a MAC address printed on a sticker on the shield
byte mac[] = { 0x90, 0xA2, 0xDA, 0x0F, 0x99, 0x3B };
// if you don't want to use DNS (and reduce your sketch size)
// use the numeric IP instead of the name for the server:
//IPAddress server(74,125,232,128);  // numeric IP for Google (no DNS)
char server[] = "data.sparkfun.com";

// Set the static IP address to use if the DHCP fails to assign
IPAddress ip(192,168,0,177);

unsigned long nextRun = 0;

// Initialize the Ethernet client library
// with the IP address and port of the server 
// that you want to connect to (port 80 is default for HTTP):
EthernetClient client;

int lightPin = A1;
int tempPin = A0;
int lightLevel;
int reading;
float voltage;
float tempC;
float tempF;

void setup() {
 // Open serial communications and wait for port to open:
 Serial.begin(57600);
 pinMode(tempPin,INPUT);
 pinMode(lightPin,INPUT);
   while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }

  // start the Ethernet connection:
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    // no point in carrying on, so do nothing forevermore:
    // try to congifure using IP address instead of DHCP:
    Ethernet.begin(mac, ip);
  }
  // give the Ethernet shield a second to initialize:
  delay(1000);
  Serial.println("connecting...");
}

void loop()
{
  // if there are incoming bytes available 
  // from the server, read them and print them:
  if (client.available()) {
    char c = client.read();
    Serial.print(c);
  }

  if (!client.connected() && millis() > nextRun){
    client.stop();
    httpRequest();
    nextRun = millis()+30000;
  }
}

void httpRequest(){
  if (client.connect(server, 80)) {
    lightRead();
    tempRead();
    
    // Print light reading
    Serial.print("Light: ");
    Serial.println(lightLevel);
    
    // Print temperature reading
    Serial.print("Temperature: ");
    Serial.print(tempC); // Celsius
    Serial.print("°C");
    Serial.print("\t");
    Serial.print(tempF); // Fahrenheit
    Serial.println("°F");
    
    Serial.println("connected");
    // Make a HTTP request:
    client.print("GET /input/bGbzn6QJJgTmWYz1r82d?private_key=VpmAXgWMM1UopdKYVyP1&light=");
    client.print(lightLevel);
    client.print("&temp_c=");
    client.print(tempC);
    client.print("&temp_f=");
    client.print(tempF);
    client.println(" HTTP/1.1");
    client.println("Host: data.sparkfun.com");
    client.println("Connection: close");
    client.println();
  }else{
    client.println("Connection Failed");
  }
}

void lightRead(){
  lightLevel=analogRead(lightPin);
}

void tempRead(){
  // get voltage reading from temperature sensor
  reading=analogRead(tempPin);
  
  // convert reading to voltage
  voltage = reading*5;
  voltage/=1024;
  
  tempC = (voltage-0.5) * 100; // Celsius
  tempF = (tempC * 9/5) + 32; // Fahrenheit
}
```