//import warehouse from '../../data/warehouse.json' assert { type: "json" };

var warehouse;


  





var board, scene, camera, renderer, controls, mouse, raycaster, selectedPiece = null;
var INTERSECTED;
var canvas11, context1, texture1, sprite1;

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

    return ground;
}

function createPalleteBox(aCoordinate, aDimension, wFloorLength, wFloorWidth)
{
    const {x, y, z} = aCoordinate;
    const {Length, Width, Height} = aDimension;

    console.log(x, y, z);
    console.log(Length, Width, Height);


    const texture = new THREE.TextureLoader().load("../../textures/crate.gif");
    var material = new THREE.MeshPhongMaterial({ map: texture });

    // console.log(pallet.Dimensions.width)
    var geom = new THREE.BoxGeometry(aDimension.Length, aDimension.Height, aDimension.Width);
    var palletBox = new THREE.Mesh(geom, material);


    palletBox.name = "pallet-" + board.children.length;
    // aPallet.translateX(Math.round(30 - Length/2)); // subtract : length / 2 
    // aPallet.translateY(Math.round(20 - Height/2)); // half of height h/2 (to bring on top of plane)
    
    // aPallet.translateZ(-30);  // camera at -30, 40, 30. half of width
    // l:8, h:5, w:3
    
    palletBox.translateX(wFloorLength/2 - Width/2); // subtract : depth / 2 
    palletBox.translateY(Height/2); // half of height h/2 (to bring on top of plane)
    palletBox.translateZ(-wFloorWidth/2 + Length/2);  // camera at -30, 40, 30. length/2

    // palletBox.position.x = palletBox.position.x - x;

    // camera.position.x += x

    

    // const myXAxis = new THREE.Vector3(1, 0, 0);
    // palletBox.translateOnWorldAxis(myXAxis, -x)


    // select the Y world axis
    const myAxis = new THREE.Vector3(0, 1, 0);
    // rotate the mesh 90 on this axis
    palletBox.rotateOnWorldAxis(myAxis, THREE.Math.degToRad(90));


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
   


   
    try {
        $.ajax({
            async: false,
            url: "https://api.jsonbin.io/v3/b/64fdaa27d972192679c1337c",
            headers: {
                "X-Master-Key": "$2b$10$GWk8ymBTd3NuWboIZsmU8OE59AKFCDvHL61VanWfWlbqmHA/8C7Ta"
            },
            success: function (data) {
                // jsonData = data.record;
                 warehouse = data.record.record;
                //debugger;
            }
        });
    } catch(error) {
        console.error('Error fetching data:', error);
    }
    



    
    
      
      


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
  
    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
  
    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    // create a canvas element
	canvas11 = document.createElement('canvas');
	context1 = canvas11.getContext('2d');
	context1.font = "Bold 28px Arial";
	context1.fillStyle = "rgba(0,0,0,0.95)";
    context1.fillText('Hello, world!', 0, 20);


    // canvas contents will be used for a texture
	texture1 = new THREE.Texture(canvas11) 
	texture1.needsUpdate = true;
	
	////////////////////////////////////////
    //
	
	var spriteMaterial = new THREE.SpriteMaterial( { map: texture1} );
	sprite1 = new THREE.Sprite( spriteMaterial );
	sprite1.scale.set(200,100,1.0);
	sprite1.position.set( 50, 50, 0 );


    // create the ground plane
    /* var planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
    const planeTexture = new THREE.TextureLoader().load('./js/floor_tile.jpg');
    var planeMaterial = new THREE.MeshPhongMaterial({ map: planeTexture });

    // var planeMaterial = new THREE.MeshLambertMaterial({color: 0x7bd9f6});
    // var planeMaterial = new THREE.MeshBasicMaterial({color: 0x7BD9F6});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
  
    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;  */

    let ground = createGround(Length, Width);
    scene.add(ground); 




   /* let x = 1; let y = 1; let width = 50; let height = 50; let radius = 20
        
    let shape = new THREE.Shape();
    shape.moveTo( x, y + radius );
    shape.lineTo( x, y + height - radius );
    shape.quadraticCurveTo( x, y + height, x + radius, y + height );
    shape.lineTo( x + width - radius, y + height );
    shape.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
    shape.lineTo( x + width, y + radius );
    shape.quadraticCurveTo( x + width, y, x + width - radius, y );
    shape.lineTo( x + radius, y );
    shape.quadraticCurveTo( x, y, x, y + radius );

    let geometry = new THREE.ShapeBufferGeometry( shape );
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});

    let mesh = new THREE.Mesh(geometry, planeMaterial)
    mesh.rotation.x = -Math.PI / 2
    scene.add(mesh) */
    

    // add the output of the renderer to the html element
    document.getElementById("webgl-output").appendChild(renderer.domElement);
  



    /* var group = new THREE.Group();
    scene.add( group );
    group.add( new THREE.Mesh( planeGeometry, new THREE.MeshBasicMaterial( { map: texture } ) ) );
    group.add( new THREE.Mesh( planeGeometry, new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.BackSide } ) ) ); */

    /* var geometry = new THREE.Geometry();

    geometry.vertices.push(point);
    geometry.vertices.push(point);

    var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({})); */

   /* const points = []
    points.push(new THREE.Vector3(0, 20, 0))
    points.push(new THREE.Vector3(0, -20, 0))
    

    const lgeometry = new THREE.BufferGeometry().setFromPoints(points)
    const lmaterial = new THREE.LineDashedMaterial({
        // for dashed lines
        color: 0xff0000,
        linewidth: 5,
        scale: 1,
        dashSize: 3,
        gapSize: 1,
      }) */
    /* var planeMaterial1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    var planeGeometry1 = new THREE.PlaneGeometry(40, 2.5, 1, 1);
    var plane1 = new THREE.Mesh( planeGeometry1, planeMaterial1 );
    plane1.rotation.y = -Math.PI / 2;
    plane1.position.y = 1.25; */
    // 90 degrees anti-clockwise around the Y-axis
    // mesh.rotation.y = Math.PI / 2;

    // const line = new THREE.Line(lgeometry, lmaterial)

    // add the plane to the scene
    // scene.add(line);
    // scene.add(plane1);
    

    
  
    
  
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

    /* const slight = new THREE.SpotLight(0xb97a20,5)
    slight.position.set(0, 0, -10)
    // for shadow
    slight.castShadow = true
    slight.shadow.mapSize.width = 1024
    slight.shadow.mapSize.height = 1024
    slight.shadow.camera.near = 0.5
    slight.shadow.camera.far = 100
    scene.add(slight) */
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

        // cube.position.y = 4;

        const {LPN, Coordinates, Dimensions, Weight, Available} = pallet;

        createPalleteBox(Coordinates, Dimensions, Length, Width)

        
        // cube.translateY(controls.translateY);
        //pallet.userData.boxDetails.Coord = 

        /*
        var randomX = -15 + Math.round(Math.random() * 30);
        var randomY = -15 + Math.round(Math.random() * 30);
        var randomZ = -15 + Math.round(Math.random() * 30);
        points.push(new THREE.Vector3(randomX, randomY, randomZ)); */


        


        /* box.name = LPN;
        box.length = Dimensions.Length;
        box.width = Dimensions.Width;
        box.height = Dimensions.Height;
        box.dim_units = Dimensions.Unit;; */

    

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
  
    controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enablePan = false;
    controls.maxPolarAngle = THREE.Math.degToRad(80);
    
    render();
  
    

    // import warehouse from './js/warehouse.json' assert { type: "json" };
}



function onMouseMove( event ) {
 
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
 
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // update sprite position
	sprite1.position.set(  mouse.x , mouse.y, 0 );
	

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
  
 // window.onload = init;

document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    init();
})

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
				INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
			// store reference to closest object as current intersection object
			INTERSECTED = intersects[ 0 ].object;
			// store color of closest object (for later restoration)
			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
			// set a new color for closest object
			// INTERSECTED.material.color.setHex( 0xE5B80B );
            INTERSECTED.material.color.setHex( 0xE5B80B );
            console.log("Box name : " + intersects[ 0 ].object.name)
			
			// update text, if it has a "name" field.
			if ( intersects[ 0 ].object.name )
			{
			    context1.clearRect(0,0,640,480);
                var boxDetails = intersects[ 0 ].object;
				var message = boxDetails.name;
                // 
                message = message + `Dimensions: ${boxDetails.length} x ${boxDetails.width} x ${boxDetails.height}`
				var metrics = context1.measureText(message);
				var width = metrics.width;
				context1.fillStyle = "rgba(0,0,0,0.95)"; // black border
				context1.fillRect( 0,0, width+8,20+8);
				context1.fillStyle = "rgba(255,255,255,0.95)"; // white filler
				context1.fillRect( 2,2, width+4,20+4 );
				context1.fillStyle = "rgba(0,0,0,1)"; // text color
				context1.fillText( message, 4,20 );
				texture1.needsUpdate = true;
			}
			else
			{
				context1.clearRect(0,0,300,300);
				texture1.needsUpdate = true;
			}
		}
	} 
	else // there are no intersections
	{
		// restore previous intersection object (if it exists) to its original color
		if ( INTERSECTED ) 
			INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
		// remove previous intersection object reference
		//     by setting current intersection object to "nothing"
		INTERSECTED = null;
		context1.clearRect(0,0,300,300);
		texture1.needsUpdate = true;
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