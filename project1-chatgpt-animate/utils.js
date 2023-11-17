function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
        0.4330127, -0.25, 0.25, 0.3,
        0.25, 0.4330127, -0.25, -0.125,
        -0.25, 0.25, 0.4330127, 0,
        0, 0, 0, 1
    ]);
    return getTransposeMatrix(transformationMatrix);
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {

    var modelviewMatrix = createTranslationMatrix(0.3, -0.25, 0);
    modelviewMatrix = multiplyMatrices(modelviewMatrix, createScaleMatrix(0.5, 0.5, 1)); 
    modelviewMatrix = multiplyMatrices(modelviewMatrix, createRotationMatrix_X(30)); 
    modelviewMatrix = multiplyMatrices(modelviewMatrix, createRotationMatrix_Y(45)); 
    modelviewMatrix = multiplyMatrices(modelviewMatrix, createRotationMatrix_Z(60)); 

    return modelviewMatrix;

    // calculate the model view matrix by using the transformation
    // methods and return the modelView matrix in this method
}

/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */
// Helper function to calculate the model view matrix at a given time

// Helper function to calculate the model view matrix at a given time
function getPeriodicMovementModelViewMatrix(elapsedTime) {
    const period = 10.0; // Total time for one complete animation cycle
    const transitionDuration = 5.0; // Time taken for the cube to transition to the target position
    const halfPeriod = period / 2.0; // Half of the total time

    // Calculate the phase within one complete cycle
    const phase = (elapsedTime % period) / period;

    // Determine the direction of the animation (1 for forward, -1 for backward)
    const direction = phase < 0.5 ? 1 : -1;

    // Calculate the progress within the current phase
    const phaseProgress = (phase % 0.5) / 0.5;

    // Interpolate between the initial and target transformations based on the progress
    const translationX = direction * 0.3 * phaseProgress;
    const rotationY = direction * (45.0 * phaseProgress);
    const modelviewMatrix = createTranslationMatrix(translationX, -0.25, 0);

    modelviewMatrix = multiplyMatrices(modelviewMatrix, createScaleMatrix(0.5, 0.5, 1));
    modelviewMatrix = multiplyMatrices(modelviewMatrix, createRotationMatrix_X(30));
    modelviewMatrix = multiplyMatrices(modelviewMatrix, createRotationMatrix_Y(rotationY));
    modelviewMatrix = multiplyMatrices(modelviewMatrix, createRotationMatrix_Z(60));

    return modelviewMatrix;
}
function getPeriodicMovement(startTime) {
    // this metdo should return the model view matrix at the given time
    // to get a smooth animation
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime) / 1000.0; // Convert to seconds

    // Calculate the model view matrix based on the elapsed time
    const modelViewMatrix = getPeriodicMovementModelViewMatrix(elapsedTime);

    return modelViewMatrix;    
}



