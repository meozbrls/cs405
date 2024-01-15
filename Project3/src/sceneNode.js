/**
 * @class SceneNode
 * @desc A SceneNode is a node in the scene graph.
 * @property {MeshDrawer} meshDrawer - The MeshDrawer object to draw
 * @property {TRS} trs - The TRS object to transform the MeshDrawer
 * @property {SceneNode} parent - The parent node
 * @property {Array} children - The children nodes
 */

class SceneNode {
    constructor(meshDrawer, trs, parent = null) {
        this.meshDrawer = meshDrawer;
        this.trs = trs;
        this.parent = parent;
        this.children = [];

        if (parent) {
            this.parent.__addChild(this);
        }
    }

    __addChild(node) {
        this.children.push(node);
    }
    
    draw(mvp, modelView, normalMatrix, modelMatrix) {
        // Apply local transformations
        var localTransformationMatrix = this.trs.getTransformationMatrix();
        var transformedMvp = MatrixMult(mvp, localTransformationMatrix);
        var transformedModelView = MatrixMult(modelView, localTransformationMatrix);
        var transformedNormals = MatrixMult(normalMatrix, localTransformationMatrix);
        var transformedModel = MatrixMult(modelMatrix, localTransformationMatrix);

        // Draw the MeshDrawer for this node
        if (this.meshDrawer) {
            this.meshDrawer.draw(transformedMvp, transformedModelView, transformedNormals, transformedModel);
        }

        // Recursively apply transformations and draw child nodes
        this.children.forEach(child => {
            child.draw(transformedMvp, transformedModelView, transformedNormals, transformedModel);
        });
    }

    

}