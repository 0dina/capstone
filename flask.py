from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

# 창문 상태
window_state = "closed"

@app.route('/open', methods=['POST'])
def open_window():
    global window_state
    if window_state == "open":
        return jsonify({"message": "Window is already open."}), 400

    try:
        subprocess.run(["python3", "motorcontrol.py", "open"], check=True)
        window_state = "open"
        return jsonify({"message": "Window opened successfully."})
    except Exception as e:
        return jsonify({"message": f"Failed to open window: {str(e)}"}), 500

@app.route('/close', methods=['POST'])
def close_window():
    global window_state
    if window_state == "closed":
        return jsonify({"message": "Window is already closed."}), 400

    try:
        subprocess.run(["python3", "motorcontrol.py", "close"], check=True)
        window_state = "closed"
        return jsonify({"message": "Window closed successfully."})
    except Exception as e:
        return jsonify({"message": f"Failed to close window: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
