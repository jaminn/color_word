from flask import Flask, jsonify, render_template, request
import split
app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('goto.html')

@app.route('/do')
def Do():
    return render_template('index.html')

@app.route('/_add_numbers')
def add_numbers():
    a = request.args.get('a', 'hello ')
    b = request.args.get('b', 'world!!')
    return jsonify(result=a + b)

@app.route('/_tonew')
def py2new():
    a = request.args.get('a', 'hello ')
    return jsonify(result=split.toNew(a))

if __name__ == '__main__':
    app.run(host='0.0.0.0')
