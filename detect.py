import cv2
from ultralytics import YOLO

# Load YOLOv8 model (nano = fastest)
model = YOLO("yolov8n.pt")

# Open webcam (0 = default camera)
cap = cv2.VideoCapture(0)

# Optional: set resolution
cap.set(3, 640)
cap.set(4, 480)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    # Run YOLOv8 detection
    results = model(frame, stream=True)

    # Draw results
    for r in results:
        annotated_frame = r.plot()

    # Show output
    cv2.imshow("YOLOv8 Webcam Detection", annotated_frame)

    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()