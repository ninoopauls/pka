import warehouse from '../../data/warehouse.json' assert { type: "json" };
import * as THREE from 'three';
import { OrbitControls } from "https://unpkg.com/three@0.145/examples/jsm/controls/OrbitControls.js";
import { DecalGeometry } from "https://unpkg.com/three@0.145/examples/jsm/geometries/DecalGeometry.js";

var board, scene, camera, renderer, controls, selectedPiece = null;
var INTERSECTED;
var mouse, raycaster, helper, decalMaterial;
var canvasS;

function createGround(length, width) {

    // var planeMaterial = new THREE.MeshLambertMaterial({color: 0x7bd9f6});
    // var groundMaterial = new THREE.MeshBasicMaterial({color: 0x7BD9F6});
    var groundMaterial = new THREE.MeshBasicMaterial({color: 0x7bd9f6});

    var groundGeometry = new THREE.PlaneGeometry(length, width);
    /* var groundMaterial = new THREE.MeshLambertMaterial({
            map: createRepeatingTexture("./js/grass.jpg", 5, 5)
    }); */
    var ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.receiveShadow  = true;
    ground.rotation.x = -0.5 * Math.PI;
    // rotate and position the plane
    ground.position.x = 0;
    ground.position.y = 0;
    ground.position.z = 0; 

    return ground;
}

function createPalleteBox(LPN, aCoordinate, aDimension, wFloorLength, wFloorWidth)
{
    const {x, y, z} = aCoordinate;
    const {Length, Width, Height} = aDimension;

    console.log(x, y, z);
    console.log(Length, Width, Height);

    const texture = new THREE.TextureLoader().load("../textures/crate.gif");
    var material = new THREE.MeshLambertMaterial({ map: texture });

    var canvas = document.createElement('canvas');
    var context = canvas.getContext( '2d' );
    context.fillStyle = 'tan';
    context.fillRect( 0, 0, 512, 512 );
    context.strokeStyle = 'blue';
    context.font = '30px Arial bold';
    context.textAlign = 'center';
    // context.fillStyle = 'lightgray';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeText(LPN, canvas.width / 2, canvas.height / 2);


    // console.log(pallet.Dimensions.width)
    var geom = new THREE.BoxGeometry(aDimension.Length, aDimension.Height, aDimension.Width);
    const canvasM = new THREE.CanvasTexture(canvas);
    var materialC = new THREE.MeshLambertMaterial( {map: canvasM} );
    materialC.needsUpdate = false;
    var palletBox = new THREE.Mesh(geom, 
        [
    	    material,
    	    material,
    	    // new THREE.MeshLambertMaterial( {color: 'lightgray'} ),
            materialC, // TOP
    	    material,
    	    material,
    	    material,
        ]  
        // material
      );

    palletBox.name = "pallet-" + board.children.length;
    palletBox.userData.name = LPN;

    palletBox.name = LPN;
    palletBox.userData.Dimensions = aDimension;
    palletBox.userData.Coordinates = aCoordinate;

    // aPallet.translateX(Math.round(30 - Length/2)); // subtract : length / 2 
    // aPallet.translateY(Math.round(20 - Height/2)); // half of height h/2 (to bring on top of plane)
    
    // aPallet.translateZ(-30);  // camera at -30, 40, 30. half of width
    // l:8, h:5, w:3
    
    palletBox.translateX(wFloorLength/2 - Width/2); // subtract : depth / 2 
    palletBox.translateY(Height/2); // half of height h/2 (to bring on top of plane)
    palletBox.translateZ(-wFloorWidth/2 + Length/2);  // camera at -30, 40, 30. length/2

    /*
    var object = new THREE.Mesh(
			new THREE.BoxGeometry( 2, 2, 2 ),
      [
    	    new THREE.MeshLambertMaterial( {color: 'lightgray'}),
    	    new THREE.MeshLambertMaterial( {color: 'lightgray'}),
    	    new THREE.MeshLambertMaterial( {map: new THREE.CanvasTexture(canvas)} ),
    	    new THREE.MeshLambertMaterial( {color: 'lightgray'}),
    	    new THREE.MeshLambertMaterial( {color: 'lightgray'}),
    	    new THREE.MeshLambertMaterial( {color: 'lightgray'}),
      ]
    );	*/

    // palletBox.position.x = palletBox.position.x - x;
    // camera.position.x += x


    // select the Y world axis
    const myAxis = new THREE.Vector3(0, 1, 0);
    // rotate the mesh 90 on this axis
    palletBox.rotateOnWorldAxis(myAxis, THREE.MathUtils.degToRad(90));


    palletBox.position.x = palletBox.position.x - y;
    // palletBox.position.y = y;
    palletBox.position.z = palletBox.position.z + x;;
    palletBox.castShadow = true;

    board.add(palletBox);
}

function createRepeatingTexture(fileName, repeatX, repeatY) {
    // var texture = THREE.ImageUtils.loadTexture(fileName);
    const texture = new THREE.TextureLoader().load(fileName);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);

    return texture;
}

function init() {

    const {Length, Width, Height} = warehouse.Dimensions;
    console.log("Warehouse Dimensions : " + Length + " x " + Width);
  
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();
    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // create a render and set the size
    renderer = new THREE.WebGLRenderer({
        antialias : true
    });

    canvasS = document.createElement('canvas');
    var context = canvasS.getContext( '2d' );
  
    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    
    // add the output of the renderer to the html element
    document.getElementById("webgl-output").appendChild(renderer.domElement);
  
    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();
    helper = new THREE.Object3D();


    let ground = createGround(Length, Width);
    scene.add(ground); 
  
    // position and point the camera to the center of the scene
    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
    camera.lookAt(scene.position);
  
    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const skyColor = 0xb1e1ff // light blue
    const groundColor = 0xb97a20 // brownish
    const light = new THREE.HemisphereLight(skyColor, groundColor)
    light.position.set(0, 8, 0)
    scene.add(light) 
    // const helper = new THREE.HemisphereLightHelper(light, 5)
    // scene.add(helper)

    /* const slight = new THREE.SpotLight(0xffffff, 2)
    slight.position.set(0, 0, 20)
    // for shadow
    slight.castShadow = true
    slight.shadow.mapSize.width = 1024
    slight.shadow.mapSize.height = 1024
    slight.shadow.camera.near = 0.5
    slight.shadow.camera.far = 100
    scene.add(slight)  */
    // const shelper = new THREE.SpotLightHelper(slight)
    // scene.add(shelper)


    // add spotlight for the shadows
    
    /* var spotLight = new THREE.SpotLight(0xffffff, 1, 180, Math.PI/4);
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.position.set(-40, 60, -10); // camera: -30, 40, 30
    spotLight.castShadow = true;
    scene.add(spotLight); */

     // add subtle ambient lighting
    /* var ambiColor = "#1c1c1c";
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight); */

    // var ambientLight = new THREE.AmbientLight( 0xffffff, 0.6 );
    // scene.add( ambientLight );

    // var target = new THREE.Object3D();
    // target.position = new THREE.Vector3(5, 0, 0);

    /* var pointColor = "#ff5808";
    var directionalLight = new THREE.DirectionalLight(pointColor, 6);
    directionalLight.position.set(-40, 60, -10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 2;
    directionalLight.shadow.camera.far = 80;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;

    directionalLight.intensity = 0.5;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    scene.add(directionalLight); */
    
    // var shadowCamera = new THREE.CameraHelper(directionalLight.shadow.camera)


    // var material = new THREE.MeshLambertMaterial({color: 0x44ff44});
    board = new THREE.Group();
    warehouse.Pallets.forEach( function (pallet) {

        const {LPN, Coordinates, Dimensions, Weight, Available} = pallet;
        createPalleteBox(LPN, Coordinates, Dimensions, Length, Width)
    })
    scene.add(board);
  
    // var materials = [
    //   new THREE.MeshLambertMaterial({opacity: 0.8, color: 0x44ff44, transparent: true}),
    //   new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true})
    // ];
  
    // var cube = THREE.SceneUtils.createMultiMaterialObject(geom, materials);

    // scene.position.set( 30, 20, -20 );
    // const axesHelper = new THREE.AxesHelper(20);
    // scene.add(axesHelper); // X == red, Y == green, Z == blue
  
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enablePan = false;
    controls.maxPolarAngle = THREE.MathUtils.degToRad(80);

    document.addEventListener( 'click', onClick );
    
    render();
}

function onClick( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    raycaster.setFromCamera( mouse, camera );

    const intersects = raycaster.intersectObjects(
        board.children.filter((mesh) => {
          return mesh.geometry.type === 'BoxGeometry'
        })
      )
    
    if ( intersects.length > 0 ) {
    
        var n = intersects[ 0 ].face.normal.clone();
        n.transformDirection( intersects[ 0 ].object.matrixWorld );
        n.add( intersects[ 0 ].point );

        helper.position.copy( intersects[ 0 ].point );
        helper.lookAt( n );
    
        var position = intersects[ 0 ].point;
        var size = new THREE.Vector3( 10, 0.5, 3 );
        
        var decalGeometry = new DecalGeometry( intersects[ 0 ].object, position, helper.rotation, size );
        decalMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, depthWrite: false, polygonOffset: true, polygonOffsetFactor: - 4, } );
        var decal = new THREE.Mesh( decalGeometry, decalMaterial );
        decal.position.z += 0.1;
        const textureS = new THREE.CanvasTexture(canvasS);
        decal.material.map = textureS;
        scene.add( decal );
          
          // board.getObjectByName(name).add(decal);
          
          
          // console.log(textureS);
          
          // decal.material.transparent = true;
    
    
    }
} 


function onMouseMove( event ) {
 
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
 
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // gsap.set(popUpEl, {
    //     x: event.clientX,
    //     y: event.clientY
    //   })

    // console.log(mouse.x)
    // console.log(mouse.y)
}

function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function render() {
    controls.update();
    hoverBoxes();
    resetBoxes();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('resize', onWindowResize, false);
window.onload = init;

/* document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    init();
}) */

function resetBoxes() {
    /* for (let i = 0; i < board.children.length; i++) {
      if (board.children[i].material) {
        board.children[i].material.opacity = board.children[i].userData.boxNumber == selectedPiece ? 0.5 : 1.0;
      }
    } */
    board.children.filter((mesh) => {
        if( mesh.geometry.type === 'BoxGeometry') {
            mesh.material.opacity = mesh.userData.boxNumber == selectedPiece ? 0.5 : 1.0;
        }
    })
}

function hoverBoxes() {

    raycaster.setFromCamera (mouse, camera);
    // const intersects = raycaster.intersectObjects(board.children);

    // create an array containing all objects in the scene with which the ray intersects
    const intersects = raycaster.intersectObjects(
        board.children.filter((mesh) => {
          return mesh.geometry.type === 'BoxGeometry'
        })
      )

	// INTERSECTED = the object in the scene currently closest to the camera 
	//		and intersected by the Ray projected from the mouse position 	
	
	// if there is one (or more) intersections
	if ( intersects.length > 0 )
	{
		// if the closest object intersected is not the currently stored intersection object
		if ( intersects[ 0 ].object != INTERSECTED ) 
		{
		    // restore previous intersection object (if it exists) to its original color
			if ( INTERSECTED ) 
                if (typeof INTERSECTED.currentHex !== 'undefined')
				    INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

			// store reference to closest object as current intersection object
			INTERSECTED = intersects[ 0 ].object;

            if (typeof INTERSECTED.material.color !== 'undefined') {
                // color is defined
                // store color of closest object (for later restoration)
			    INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
			    // set a new color for closest object
			    INTERSECTED.material.color.setHex( 0xE5B80B );
            }
			
            // INTERSECTED.material.color.setHex( 0xE5B80B );
            console.log("Box name : " + intersects[ 0 ].object.userData.name)
			
		}
	} 
	else // there are no intersections
	{
		// restore previous intersection object (if it exists) to its original color
	    if ( INTERSECTED ) 
            if (typeof INTERSECTED.currentHex !== 'undefined')
		        INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
		// remove previous intersection object reference
		//     by setting current intersection object to "nothing"
		INTERSECTED = null;
	}

    
    /* for (let i = 0; i < intersects.length; i++)
    {
        let box = intersects[i].object;

        // console.log("Selected box number " + box)
        intersects[i].object.material.transparent = true;
        intersects[i].object.material.opacity = 0.5;

        // gsap.set(popUpEl, {
        //     display: 'block'
        //   })
        
       

       
    } */
}
    
/*
function toScreenPosition(obj, camera)
{
    var vector = new THREE.Vector3();

    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return { 
        x: vector.x,
        y: vector.y
    };

};
*/

/*

our ambient light configuration was not correct. The intensity value was again way too hight. Try it with:

var ambientLight = new THREE.AmbientLight( 0xffffff, 0.6 );
scene.add( ambientLight );
Besides, you should also configure the renderer to output sRGB for proper colors:

renderer.outputEncoding = THREE.sRGBEncoding;
It looks then like so:


        var light = new THREE.DirectionalLight( 0xffffff, 10.0,5000 );
		scene.add( light );
		light.position.set(0,10,0);
		light.castShadow=true;
		light.shadow.camera.near = 1;
		light.shadow.camera.far = 5;
		light.shadow.camera.right = 1;
		light.shadow.camera.left = - 1;
		light.shadow.camera.top	= 1;
		light.shadow.camera.bottom = -0;
		light.shadow.mapSize.width = 500;
		light.shadow.mapSize.height = 509;

        DirectionalLight has only two parameters. color and intensity. An intensity value of 10 is usually way too high. Try it with 1 instead

*/        

/* function createFloor() {

    let pos = { x: 0, y: -1, z: 3 };
    let scale = { x: 100, y: 2, z: 100 };
    
    let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(),
        new THREE.MeshPhongMaterial({ color: 0x000000 }));
    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);
    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;
    scene.add(blockPlane);
   
} */

/*

    // Make use of the `TextureLoader` object to handle asynchronus loading and
    // assignment of the texture to your material    
    // var planeMaterial = new THREE.MeshBasicMaterial({color: 0xad9773});
    /* var loader = new THREE.TextureLoader();
    loader.load( 'https://images.pexels.com/photos/358482/pexels-photo-358482.jpeg?auto=compress&cs=tinysrgb', 
        function ( texture ) {    

            // The texture has loaded, so assign it to your material object. In the 
            // next render cycle, this material update will be shown on the plane 
            // geometry
            planeMaterial.map = texture;
            
            planeMaterial.needsUpdate = true;
        }
    ); */

    /* var planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.receiveShadow = true;

    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;

    // add the plane to the scene
    scene.add(plane); 

*/