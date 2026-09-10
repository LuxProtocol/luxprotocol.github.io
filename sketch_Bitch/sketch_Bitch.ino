#include <Wire.h>
#include <Seeed_Arduino_SSCMA.h>

#define SDA_PIN 5
#define SCL_PIN 6

SSCMA AI;

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println();
  Serial.println("=== Grove Vision AI V2 Test ===");

  // Initialize I2C using your pins
  Wire.begin(SDA_PIN, SCL_PIN);

  // Start Grove Vision AI V2
  AI.begin();

  Serial.println("Grove Vision AI V2 initialized.");
}

void loop() {
  Serial.println("Requesting inference...");

  if (AI.invoke()) {
    Serial.println("Inference successful!");

    Serial.print("Objects detected: ");
    Serial.println(AI.boxes().size());

    for (int i = 0; i < AI.boxes().size(); i++) {
      Serial.print("Object ");
      Serial.print(i);
      Serial.print(": ");

      Serial.print("Target = ");
      Serial.print(AI.boxes()[i].target);

      Serial.print("  Score = ");
      Serial.println(AI.boxes()[i].score);
    }
  }
  else {
    Serial.println("Inference failed.");
  }

  Serial.println("-----------------------------");

  delay(1000);
}