# World Mood
The worlds mood at a glance

**Advanced Topics in Web Programming 1501**
**Capstone Project**

---

**Holly Springsteen**

[hollyspringsteen.com](https://hollyspringsteen.com)

hhspringsteen@gmail.com

### Overview
---
This month, you've learned many ways to implement new types of Input and Output using an Arduino. To close out the month, please create a project that showcases the use of Arduino working in conjunction with the Web Technologies you've been taught during your time at Full Sail.

### Project
---
![Arduino Mood Light](http://res.cloudinary.com/hollyspringsteen/image/upload/v1422714192/20150131_092144_t9k5vy.jpg "Arduino Mood Light")

---

##### Project Code
---
``` cpp
#include <HtmlParser.h>
#include <TwitterParser.h>
#include <Twitter.h>
#include <string.h>

#include <ShiftBrite.h>

#include <SPI.h>
#include <Dhcp.h>
#include <Dns.h>
#include <Ethernet.h>
#include <EthernetClient.h>
#include <EthernetServer.h>
#include <EthernetUdp.h>
#include <util.h>

byte mac[] = { 0x90, 0xA2, 0xDA, 0x0F, 0x99, 0x3B };
char server[] = "api.twitter.com";
IPAddress ip(192,168,0,177);
unsigned long nextRun = 0;
EthernetClient client;

Twitter twitter("2863998855-5iVDs0fWXZqANd6zVSf2ruEX1zrwFQOf5D5sfkN");

int datapin = 5;
int latchpin = 6;
int enablepin = 10;
int clockpin = 11;

ShiftBrite shift(datapin,latchpin,enablepin,clockpin); //construct

const char* moodNames[] = {
  "love",
  "joy",
  "surprise",
  "anger",
  "envy",
  "sadness",
  "fear"
};

const char* moodIntensityNames[] = {
  "mild",
  "considerable",
  "extreme"
};

// the long term ratios between tweets with emotional content
// as discovered by using the below search terms over a period of time.
float tempramentRatios[] = {
  0.13f,
  0.15f,
  0.20f,
  0.14f,
  0.16f,
  0.12f,
  0.10f
};

// save battery, put the wifly to sleep for this long between searches (in ms)
#define SLEEP_TIME_BETWEEN_SEARCHES (1000 * 5)

// Store search strings in flash (program) memory instead of SRAM.
// http://www.arduino.cc/en/Reference/PROGMEM
// edit TWEETS_PER_PAGE if changing the rpp value
prog_char string_0[] PROGMEM = "GET /search.json?q=\"i+love+you\"+OR+\"i+love+her\"+OR+\"i+love+him\"+OR+\"all+my+love\"+OR+\"i'm+in+love\"+OR+\"i+really+love\"&rpp=30&result_type=recent";
prog_char string_1[] PROGMEM = "GET /search.json?q=\"happiest\"+OR+\"so+happy\"+OR+\"so+excited\"+OR+\"i'm+happy\"+OR+\"woot\"+OR+\"w00t\"&rpp=30&result_type=recent";
prog_char string_2[] PROGMEM = "GET /search.json?q=\"wow\"+OR+\"O_o\"+OR+\"can't+believe\"+OR+\"wtf\"+OR+\"unbelievable\"&rpp=30&result_type=recent";
prog_char string_3[] PROGMEM = "GET /search.json?q=\"i+hate\"+OR+\"really+angry\"+OR+\"i+am+mad\"+OR+\"really+hate\"+OR+\"so+angry\"&rpp=30&result_type=recent";
prog_char string_4[] PROGMEM = "GET /search.json?q=\"i+wish+i\"+OR+\"i'm+envious\"+OR+ \"i'm+jealous\"+OR+\"i+want+to+be\"+OR+\"why+can't+i\"+&rpp=30&result_type=recent";
prog_char string_5[] PROGMEM = "GET /search.json?q=\"i'm+so+sad\"+OR+\"i'm+heartbroken\"+OR+\"i'm+so+upset\"+OR+\"i'm+depressed\"+OR+\"i+can't+stop+crying\"&rpp=30&result_type=recent";
prog_char string_6[] PROGMEM = "GET /search.json?q=\"i'm+so+scared\"+OR+\"i'm+really+scared\"+OR+\"i'm+terrified\"+OR+\"i'm+really+afraid\"+OR+\"so+scared+i\"&rpp=30&result_type=recent";

// be sure to change this if you edit the rpp value above
#define TWEETS_PER_PAGE (1000)

PROGMEM const char *searchStrings[] = {   
  "love",
  "joy",
  "surprise",
  "anger",
  "envy",
  "sadness",
  "fear"
};


void setup(){
  Serial.begin(57600);
  
  // start the Ethernet connection:
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    // no point in carrying on, so do nothing forevermore:
    // try to congifure using IP address instead of DHCP:
    Ethernet.begin(mac, ip);
  }
  // give the Ethernet shield a second to initialize:
  Serial.println("connecting...");
}

void loop(){
  if (client.available()) {
    char c = client.read();
    Serial.print(c);
  }

  if (!client.connected() && millis() > nextRun){
    TwitterParser twitterSearchParser(Serial, TWEETS_PER_PAGE);
    
    client.stop();
    nextRun = millis()+30000;
    
    char searchString[160];

    for(int i=0;i<7;i++){
      twitterSearchParser.Reset();
 
      // read in new search string to SRAM from flash memory
      strcpy_P(searchString, (char*)pgm_read_word(&(searchStrings[i])));
 
      httpRequest(moodNames[i]);
//      float tweetsPerMinute = twitterSearchParser.GetTweetsPerMinute();
//
//      // debug code
//      Serial.println("");
//      Serial.print(moodNames[i]);
//      Serial.print(": tweets per min = ");
//      Serial.println(tweetsPerMinute);
//      
//      light(moodNames[i]);
//      delay(500);
    }
  }
}

void httpRequest(String searchString){
  if (client.connect(server, 80)){
    Serial.println("connected");
    
    // Make a HTTP request:
    client.print("GET /1.1/search/tweets.json?q=");
    client.print(searchString);
    client.print("&result_type=recent");
    client.println(" HTTP/1.1");
    client.print("Authorization: OAuth");
    client.print("oauth_consumer_key=DC0sePOBbQ8bYdC8r4Smg,oauth_signature_method=HMAC-SHA1,oauth_timestamp=1422688041,oauth_nonce=2563348322,oauth_version=1.0,oauth_token=2863998855-3HmqL6gWqDfYJVb99ef4JMM47vSeDYCwoxuZskX,oauth_signature=Sj0pomTFAt%2FmyNty9137%2Fr9B%2BYk%3D");
    client.print("Host: api.twitter.com");
    client.println("Connection: close");
    client.println();
    
    light(moodNames[0]);
  }else{
    client.println("Connection Failed");
  }
}

void light(String mood){
  Serial.println(mood);
  
  if(mood == "love"){
    Serial.println("1");
    shift.sendColor(224,33,138);
    delay(800);
  }
  else if(mood == "joy"){
    Serial.println("2.......");
    shift.sendColor(238,210,2);
    delay(2000);
    Serial.println(".....2");
  }
  else if(mood == "surprise"){
    Serial.println("3");
    shift.sendColor(255,97,3);
    delay(800);
  }
  else if(mood == "anger"){
    Serial.println("4");
    shift.sendColor(250,0,0);
    delay(800);
  }
  else if(mood == "envy"){
    Serial.println("5");
    shift.sendColor(0,255,0);
    delay(800);
  }
  else if(mood == "sadness"){
    Serial.println("6");
    shift.sendColor(0,0,255);
    delay(800);
  }
  else if(mood == "fear"){
    Serial.println("7");
    shift.sendColor(255,255,255);
    delay(800);
  }
}

void tweet(char msg[]) {
  Serial.println("connecting ...");
  if (twitter.post(msg)) {
    int status = twitter.wait(&Serial);
    if (status == 200) {
      Serial.println("OK.");
    } else {
      Serial.print("failed : code ");
      Serial.println(status);
    }
  } else {
    Serial.println("connection failed.");
  }
}
```