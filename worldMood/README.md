# Arduino Data Logging


**Advanced Topics in Web Programming 1501**

---

**Holly Springsteen**

[hollyspringsteen.com](https://hollyspringsteen.com)

hhspringsteen@gmail.com

### Overview
---
Using Xively, data.sparkfun.com or another similar service, you will need to collect 24 hours worth of environmental data using an Arduino and the Ethernet Shield. You will then create a web interface for displaying that data to users.

### Project
---

![Arduino Mood Lightr](http://res.cloudinary.com/hollyspringsteen/image/upload/v1422714192/20150131_092144_t9k5vy.jpg "Arduino Data Mood Light")

---
How does the world feel? Well World Mood will let you know. Using an Ethernet Shield, Arduino Uno, and the ShiftBrite light World Mood displays the current mood of twitter based on keyword searches.

| Feeling    | Color    |
| -----------|:--------:|
| Anger      | Red      |
| Happy      | Yellow   |
| Love       | Pink     |
| Fear       | White    |
| Envy       | Green    |
| Surprise   | Orange   |
| Sad        | Blue     |

##### Project Code
---
``` cpp
#include <HtmlParser.h>
#include <TwitterParser.h>
#include <Twitter.h>
#include <string.h>

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

#include <ShiftBrite.h>

int datapin = 5;
int latchpin = 6;
int enablepin = 3;
int clockpin = 2;

ShiftBrite shift(datapin,latchpin,enablepin,clockpin); //construct

const char* moodNames[] = {
  "love",
  "joy",
  "surprise",
  "anger",
  "envy",
  "sadness",
  "afraid"
};

const char* moodIntensityNames[] = {
  "mild",
  "considerable",
  "extreme"
};

#define TWEETS_PER_PAGE (1000)

PROGMEM const char *searchStrings[] = {   
  "love",
  "joy",
  "surprise",
  "anger",
  "envy",
  "sadness",
  "afraid"
};

int love = 0;
int joy = 0;
int surprise = 0;
int anger = 0;
int envy = 0;
int sadness = 0;
int afraid = 0;
float num = 0;
String name = "";
int turn = 1;
int turnWin = 0;
unsigned long winTime = 0;
String searchVar = "";


void setup(){
  Serial.begin(57600);
  
  pinMode(8,OUTPUT);
  
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
  if (client.connect(server, 80)){
    Serial.println("connection");
    char c = client.read();
    Serial.println(c);
    
    for(int i=0;i<7;i++){
      httpRequest (moodNames[i]);
    }
    turn++;
  }

  if (!client.connected() && millis() > nextRun){
    client.stop();
    Serial.println("connection closed");
    Serial.println("");
    Serial.println("-------------------------------------------");
    Serial.print  ("                                   Turn ");
    Serial.println(turn);
    Serial.print  ("                                   Time ");
    Serial.println(millis());
    Serial.println("");
    nextRun = millis()+10000;
  }
}

void httpRequest(String searchString){
  Serial.print("search: ");
  Serial.println(searchString);
  Serial.print("http ");
  if (client){    
    Serial.print(searchString);
    Serial.println(" connected");
    
    // Code will not run if these addresses are included
//    if(searchString == "love"){
//      searchVar = "i+love+you\"+OR+\"i+love+her\"+OR+\"i+love+him\"+OR+\"all+my+love\"+OR+\"i'm+in+love\"+OR+\"i+really+love\"&rpp=30";
//    }
//    if(searchString == "joy"){
//      searchVar = "happiest\"+OR+\"so+happy\"+OR+\"so+excited\"+OR+\"i'm+happy\"+OR+\"woot\"+OR+\"w00t\"&rpp=30";
//    }
//    if(searchString == "surprise"){
//      searchVar = "wow\"+OR+\"O_o\"+OR+\"can't+believe\"+OR+\"wtf\"+OR+\"unbelievable\"&rpp=30";
//    }
//    if(searchString == "anger"){
//      searchVar = "i+hate\"+OR+\"really+angry\"+OR+\"i+am+mad\"+OR+\"really+hate\"+OR+\"so+angry\"&rpp=30";
//    }
//    if(searchString == "envy"){
//      searchVar = "i+wish+i\"+OR+\"i'm+envious\"+OR+ \"i'm+jealous\"+OR+\"i+want+to+be\"+OR+\"why+can't+i\"+&rpp=30";
//    }
//    if(searchString == "sadness"){
//      searchVar = "i'm+so+sad\"+OR+\"i'm+heartbroken\"+OR+\"i'm+so+upset\"+OR+\"i'm+depressed\"+OR+\"i+can't+stop+crying\"&rpp=30";
//    }
//    if(searchString == "afraid"){
//      searchVar = "i'm+so+scared\"+OR+\"i'm+really+scared\"+OR+\"i'm+terrified\"+OR+\"i'm+really+afraid\"+OR+\"so+scared+i\"&rpp=30";
//    }
    
    // Make a HTTP request:
    client.print("GET /1.1/search/tweets.json?q=");
    client.print(searchString);
    client.print("&result_type=recent");
    client.println(" HTTP/1.1");
    client.println("Authorization: OAuth");
    client.println("oauth_consumer_key=\"DC0sePOBbQ8bYdC8r4Smg\",oauth_signature_method=\"HMAC-SHA1\",oauth_timestamp=\"1422688041\",oauth_nonce=\"2563348322\",oauth_version=\"1.0\",oauth_token=\"2863998855-3HmqL6gWqDfYJVb99ef4JMM47vSeDYCwoxuZskX\",oauth_signature=\"Sj0pomTFAt%2FmyNty9137%2Fr9B%2BYk%3D\"");
    client.println("Host: api.twitter.com");
    client.println("X-Target-URI: https://api.twitter.com");
    client.println("Connection: Keep-Alive");
    client.println();
    
    TwitterParser twitterSearchParser(Serial, 1000);
    
    float tweetsPerMinute = twitterSearchParser.GetTweetsPerMinute();
    int rand = random(-15,15);
    float tpm = tweetsPerMinute + rand;
    if(tpm < 0){
      tpm = 0.00;
    }
    
//    if(searchString == "surprise"){
//      // used to force a result
//      tweetsPerMinute = 9001; // OVER 9000!!!!!!
//    }

    // debug code
    Serial.print(searchString);
    Serial.print(": tweets per min = ");
    Serial.println(tpm);
    Serial.print("current: ");
    Serial.print(name);
    Serial.print(" - ");
    Serial.print(num);
    Serial.print(" - Turn ");
    Serial.print(turnWin);
    Serial.print(" (");
    Serial.print(winTime);
    Serial.println(")");
    if(tpm >= num){
      num = tweetsPerMinute;
      name = searchString;
      turnWin = turn;
      winTime = millis();
      light(searchString);
    }else{
      Serial.println("");
      twitterSearchParser.Reset();
    }
    
    twitterSearchParser.Reset();
  }else{
    client.println("Connection Failed");
    for (int y=0;y<3;y++){
      shift.sendColor(250,0,0);
      delay(300);
      shift.sendColor(0,255,0);
      delay(300);
      shift.sendColor(0,0,255);
    }
  }
}

void light(String mood){
  Serial.print(mood);
  Serial.print(" --> ");
  if(mood == "love"){
    // love = pink
    Serial.println("1");
    shift.sendColor(224,33,138);
  }
  else if(mood == "joy"){
    // joy = yellow
    Serial.println("2");
    shift.sendColor(255,255,0);
  }
  else if(mood == "surprise"){
    // surprise = orange
    Serial.println("3");
    shift.sendColor(255,97,3);
  }
  else if(mood == "anger"){
    // anger = red
    Serial.println("4");
    shift.sendColor(250,0,0);
  }
  else if(mood == "envy"){
    // envy = green
    Serial.println("5");
    shift.sendColor(0,255,0);
  }
  else if(mood == "sadness"){
    // sadness = blue
    Serial.println("6");
    shift.sendColor(0,0,255);
  }
  else if(mood == "afraid"){
    // afraid = white
    Serial.println("7");
    shift.sendColor(255,255,255);
  }
  Serial.println("");
}
```