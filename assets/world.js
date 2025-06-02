var colors = {
	red: 0xf25346,
	white: 0xd8d0d1,
	pink: 0xFDA7DF,
	blue: 0x04476E,
	black: 0x303952
};
var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container, loader, manager;
var hemisphereLight, shadowLight;
var sea, sky, plane;
var mousePos = {
	x: 0,
	y: 0
};

window.addEventListener("load", init, false);

function init() {
	createScene();
	createLights();
	createPlane();
	createSea();
	createSky();
	
	document.addEventListener('mousemove', handleMouseMove, false);
	
	loop();
}

function loop() {
	sea.mesh.rotation.z += .003;
	sky.mesh.rotation.z += .01;
	
	updatePlane();
	plane.pilot.updateHair();
	sea.moveWaves();
	
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

function updatePlane() {
	var targetX = normalize(mousePos.x, -.75, .75, -100, 100);
	var targetY = normalize(mousePos.y, -.75, .75, 25, 175);

	plane.mesh.position.y += (targetY - plane.mesh.position.y) * 0.1;
	plane.mesh.position.x += (targetX - plane.mesh.position.x) * 0.1;
	
	plane.mesh.rotation.x = (plane.mesh.position.y - targetY) * 0.005;
	plane.mesh.rotation.z = (targetY - plane.mesh.position.y) * 0.01;
	
	plane.propeller.rotation.x += 0.3;
}

function normalize(v,vmin,vmax,tmin, tmax){
	var nv = Math.max(Math.min(v,vmax), vmin);
	var dv = vmax-vmin;
	var pc = (nv-vmin)/dv;
	var dt = tmax-tmin;
	var tv = tmin + (pc*dt);
	return tv;
}

function createScene() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(colors.pink, 100, 950);
	
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	camera.position.x = 0;
	camera.position.y = 100;
	camera.position.z = 150;
	
	renderer = new THREE.WebGLRenderer({
		alpha: true, 
		antialias: true 
	});
	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = true;
	
	container = document.querySelector(".world");
	container.appendChild(renderer.domElement);
	
	window.addEventListener("resize", handleWindowResize, false);
}

function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
	renderer.render(scene, camera);
}

function createLights() {
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);
	ambientLight = new THREE.AmbientLight(0x74b9ff, 0.8);
	scene.add(ambientLight);

	shadowLight.position.set(150, 350, 350);
	shadowLight.castShadow = true;
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}

function createPlane() {
	plane = new Plane();
	plane.mesh.scale.set(.25, .25, .25);
	plane.mesh.position.y = 100;
	scene.add(plane.mesh);
}

function createSea() {
	sea = new Sea();
	sea.mesh.position.y = -600;
	scene.add(sea.mesh);
}

function createSky() {
	sky = new Sky();
	sky.mesh.position.y = -600;
	scene.add(sky.mesh);
}

var Sea = function() {
	var geometry = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
	geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	geometry.mergeVertices();
	
	var l = geometry.vertices.length;
	this.waves = [];
	
	for(var i = 0; i < l; i++) {
		var v = geometry.vertices[i];
		this.waves.push({
			y: v.y,
			x: v.x,
			z: v.z,
			ang: Math.random() * Math.PI * 2,
			amp: 5 + Math.random() * 15,
			speed: 0.016 + Math.random() * 0.032
		});
	}
		 
	var mat = new THREE.MeshPhongMaterial({
		color: colors.blue,
		transparent: true,
		opacity: .9,
		flatShading: true,
	}); 
	
	this.mesh = new THREE.Mesh(geometry, mat);
	this.mesh.receiveShadow = true;
	
}

Sea.prototype.moveWaves = function() {
	var verts = this.mesh.geometry.vertices;
	var l = verts.length;
	
	for(var i = 0; i < l; i++) {
		var v = verts[i];
		var vprops = this.waves[i];
		
		v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
		v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;
		
		vprops.ang += vprops.speed;
	}
		
	this.mesh.geometry.verticesNeedUpdate = true;
	sea.mesh.rotation.z += .005;
}

var Cloud = function() {
	this.mesh = new THREE.Object3D;
	var geometry = new THREE.BoxGeometry(20, 10, 10);
	var mat = new THREE.MeshPhongMaterial({
		color: colors.white
	});
	
	var nBlocks = 3 + Math.floor(Math.random() * 3);
	
	for(let i = 0; i < nBlocks; i++) {
		var m = new THREE.Mesh(geometry, mat);
		
		m.position.x = i * 15;
		m.position.y = Math.random() * 10;
		m.position.z = Math.random() * 10;
		m.rotation.y = Math.random() * Math.PI * 2;
		m.rotation.z = Math.random() * Math.PI * 2;
		
		var s = .1 + Math.random() * .9;
		m.scale.set(s, s, s);
		
		m.castShadow = true;
		m.receiveShadow = true;
		
		this.mesh.add(m);
	}
}

var Sky = function() {
	this.mesh = new THREE.Object3D();
	
	this.nClouds = 20;
	var stepAngle = Math.PI * 2 / this.nClouds;
	
	for(let i = 0; i < this.nClouds; i++) {
		var c = new Cloud();
		
		var a = stepAngle * i;
		var h = 750 + Math.random() * 200;
		
		c.mesh.position.y = Math.sin(a) * h;
		c.mesh.position.x = Math.cos(a) * h;
		
		c.mesh.rotation.z = a + Math.PI / 2;
		
		c.mesh.position.z = -400 - Math.random() * 400;
		
		var s = 1 + Math.random() * 2;
		c.mesh.scale.set(s, s, s);
		
		this.mesh.add(c.mesh);
	}
}

var Plane = function() {
	this.mesh = new THREE.Object3D();
	var geomCockpit = new THREE.BoxGeometry(80,50,50,1,1,1);
	var matCockpit = new THREE.MeshPhongMaterial({color:colors.red, flatShading:true});
	
	geomCockpit.vertices[4].y -= 10;
	geomCockpit.vertices[4].z += 20;
	geomCockpit.vertices[5].y -= 10;
	geomCockpit.vertices[5].z -= 20;
	geomCockpit.vertices[6].y += 30;
	geomCockpit.vertices[6].z += 20;
	geomCockpit.vertices[7].y += 30;
	geomCockpit.vertices[7].z -= 20;
	
	var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
	cockpit.castShadow = true;
	cockpit.receiveShadow = true;
	this.mesh.add(cockpit);
	
	var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
	var matEngine = new THREE.MeshPhongMaterial({color:colors.white, shading:THREE.FlatShading});
	var engine = new THREE.Mesh(geomEngine, matEngine);
	engine.position.x = 40;
	engine.castShadow = true;
	engine.receiveShadow = true;
	this.mesh.add(engine);
	
	var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
	var matTailPlane = new THREE.MeshPhongMaterial({color:colors.red, shading:THREE.FlatShading});
	var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
	tailPlane.position.set(-35,25,0);
	tailPlane.castShadow = true;
	tailPlane.receiveShadow = true;
	this.mesh.add(tailPlane);
	
	var geomSideWing = new THREE.BoxGeometry(40,8,150,1,1,1);
	var matSideWing = new THREE.MeshPhongMaterial({color:colors.red, shading:THREE.FlatShading});
	var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
	sideWing.castShadow = true;
	sideWing.receiveShadow = true;
	this.mesh.add(sideWing);
	
	var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
	var matPropeller = new THREE.MeshPhongMaterial({color:colors.black, shading:THREE.FlatShading});
	this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
	this.propeller.castShadow = true;
	this.propeller.receiveShadow = true;
	
	var geomBlade = new THREE.BoxGeometry(1,100,20,1,1,1);
	var matBlade = new THREE.MeshPhongMaterial({color:colors.black, shading:THREE.FlatShading});
	
	var blade = new THREE.Mesh(geomBlade, matBlade);
	blade.position.set(8,0,0);
	blade.castShadow = true;
	blade.receiveShadow = true;
	this.propeller.add(blade);
	this.propeller.position.set(50,0,0);
	this.mesh.add(this.propeller);
	
	this.pilot = new Pilot();
	this.pilot.mesh.position.set(-3,30,0);
	this.mesh.add(this.pilot.mesh);
}

var Pilot = function() {
	this.mesh = new THREE.Object3D;
	this.mesh.name = "pilot";
	this.hairAngle = 0;
	
	var bodyGeometry = new THREE.BoxGeometry(15, 15, 15);
	var bodyMat = new THREE.MeshPhongMaterial({
		color: colors.blue,
		flatShading: true
	});
	var body = new THREE.Mesh(bodyGeometry, bodyMat);
	body.position.set(2, -12, 0);
	this.mesh.add(body);
	
	var faceGeometry = new THREE.BoxGeometry(10,10,10);
	var faceMat = new THREE.MeshLambertMaterial({color: colors.pink});
	var face = new THREE.Mesh(faceGeometry, faceMat);
	this.mesh.add(face);
	
	var hairGeometry = new THREE.BoxGeometry(4, 4, 4);
	var hairMat = new THREE.MeshLambertMaterial({color: colors.black});
	var hair = new THREE.Mesh(hairGeometry, hairMat);
	hair.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,2,0));
	
	var hairstyle = new THREE.Object3D();
	var startPosX = -4;
	var startPosZ = -4;
	
	this.hairTop = new THREE.Object3D();
	for(let i = 0; i < 12; i++) {
		let h = hair.clone();
		let col = i % 3;
		let row = Math.floor(i / 3);
		h.position.set(startPosX + row * 4, 0, startPosZ + col * 4);
		h.geometry.applyMatrix(new THREE.Matrix4().makeScale(1,1,1));
		this.hairTop.add(h);
	}
	
	var hairSideGeom = new THREE.BoxGeometry(12,4,2);
	hairSideGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-6,0,0));
	var hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
	var hairSideL = hairSideR.clone();
	hairSideR.position.set(8,-2,6);
	hairSideL.position.set(8,-2,-6);
	hairstyle.add(hairSideR);
	hairstyle.add(hairSideL);

	var hairBackGeom = new THREE.BoxGeometry(2,8,10);
	var hairBack = new THREE.Mesh(hairBackGeom, hairMat);
	hairBack.position.set(-1,-4,0)
	hairstyle.add(hairBack);
	hairstyle.position.set(-5,5,0);
	
	hairstyle.add(this.hairTop);
	this.mesh.add(hairstyle);
	
}

Pilot.prototype.updateHair = function() {
	let hair = this.hairTop.children;
	let n = hair.length;
	for(let i = 0; i < n; i++) {
		let h = hair[i];
		h.scale.y = .75 + Math.cos(this.hairAngle + 1/3) * .25;
	}
	this.hairAngle += 0.16;
}

function handleMouseMove(event) {
	var tx = -1 + (event.clientX / WIDTH) * 2;
	var ty = 1 - (event.clientY / HEIGHT) * 2;
	
	mousePos = {
		x: tx,
		y: ty
	};
}