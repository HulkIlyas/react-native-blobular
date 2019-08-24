const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";
const CENTERX = 400;
const CENTERY = 300;
const VISCOSITY = 75;

window.addEventListener(
  'load',
  () => new Blob(
    200,
    CENTERX,
    CENTERY,
  ),
  false,
);

function Blob(radius, h, k) {
  const self = this;
  this.bigCircleR = radius;
  this.bigCircleH = h;
  this.bigCircleK = k;
  this.bigCircleOriginH = h;
  this.bigCircleOriginK = k;
  this.mousedownCoords = [h, k];
  this.joinCircleR = VISCOSITY;
  this.smallCircleR = 50;
  this.smallCircleH = 0;
  this.smallCircleK = 0 - this.bigCircleR + this.smallCircleR - 1;
		
  this.lavaPath = document.createElementNS(SVG_NS, "path");
  this.lavaPath.setAttributeNS(null, "class", "lavaPath");
  this.lavaPath.objRef = this;
	
  this.reset = function() {
  this.lavaPath.setAttributeNS(
    null, 
    'transform',
    `translate(${this.bigCircleH}, ${this.bigCircleK})`,
  );
  this.lavaPath.setAttribute(
    'd',
      [
        `m 0 ${-this.bigCircleR} A ${this.bigCircleR} ${this.bigCircleR} 0 1 1 0 ${this.bigCircleR}`,
        `A ${this.bigCircleR} ${this.bigCircleR} 0 1 1 0 ${-this.bigCircleR}`,
      ]
        .join(''),
    );
  };
    //mode = [join, separation]
    this.drawSomething = function(distance, angle, mode) {
      if (mode === 'join') {
		this.lavaPath.setAttributeNS(null, "class", "lavaPath joining");
      }
      this.lavaPath.setAttributeNS(
        null,
        'transform',
        `translate(${this.bigCircleH}, ${this.bigCircleK}) rotate(${angle}, 0, 0)`,
      );
	  this.smallCircleK = 0 - this.bigCircleRMax + this.smallCircleR - distance;
      if (mode === 'join') {
		this.joinCircleRMin = 1;
		this.joinCircleRMax = 200;
      } else if (mode === 'separation') {
	    this.joinCircleR = VISCOSITY;
      }

      const startK = (mode === 'join') ? 0 - this.bigCircleRMin - this.smallCircleR : 0 - this.bigCircleRMax + this.smallCircleR - 1;
	  const finalK = (mode === 'join') ? 0 - this.bigCircleRMax + this.smallCircleR - 1: 0 - this.bigCircleRMin - this.joinCircleR * 2 - this.smallCircleR;
	  const differenceK = startK - finalK;
      const currDifferenceK = this.smallCircleK - finalK;
	  const differencePercentage = currDifferenceK / differenceK;

      if (mode === 'join') {
		this.bigCircleR = this.bigCircleRMax - (this.bigCircleRMax - this.bigCircleRMin) * differencePercentage;
		this.joinCircleR = this.joinCircleRMax - (this.joinCircleRMax - this.joinCircleRMin) * differencePercentage;
      } else if (mode === 'separation') {
	    this.bigCircleR = this.bigCircleRMin + (this.bigCircleRMax - this.bigCircleRMin) * differencePercentage;
      }

	  const triangleA = this.bigCircleR + this.joinCircleR; // Side a
	  const triangleB = this.smallCircleR + this.joinCircleR; // Side b
	  const triangleC = Math.abs(this.smallCircleK); // Side c
	  const triangleP = (triangleA + triangleB + triangleC) / 2; // Triangle half perimeter

      const e = (triangleP * (triangleP - triangleA) * (triangleP - triangleB) * (triangleP - triangleC));
      const triangleArea = Math.sqrt(mode === 'join' ? e : Math.abs(e));
      const isBigger = (triangleC >= triangleA);

      const triangleH = isBigger ? 2 * triangleArea / triangleC : 2 * triangleArea / triangleA;
      const triangleD = isBigger ? Math.sqrt(Math.pow(triangleA, 2) - Math.pow(triangleH, 2)) : Math.sqrt(Math.pow(triangleC, 2) - Math.pow(triangleH, 2));

      var bigCircleTan = triangleH / triangleD;
	  var bigCircleAngle = Math.atan(bigCircleTan);
	  var bigCircleSin = Math.sin(bigCircleAngle);
	  var bigCircleIntersectX = bigCircleSin * this.bigCircleR;
	  var bigCircleCos = Math.cos(bigCircleAngle);
	  var bigCircleIntersectY = bigCircleCos * this.bigCircleR;

	  var joinCircleH = bigCircleSin * (this.bigCircleR + this.joinCircleR);
	  var joinCircleK = -bigCircleCos * (this.bigCircleR + this.joinCircleR);

      var coord1X = -bigCircleIntersectX;
	  var coord1Y = -bigCircleIntersectY;
	  var coord2X = bigCircleIntersectX;
	  var coord2Y = -bigCircleIntersectY;

      const smallCircleTan = (this.smallCircleK - joinCircleK) / (this.smallCircleH - joinCircleH);
	  const smallCircleAngle = Math.atan(smallCircleTan);
	  const smallCircleIntersectX = joinCircleH - Math.cos(smallCircleAngle) * (this.joinCircleR);
	  const smallCircleIntersectY = joinCircleK - Math.sin(smallCircleAngle) * (this.joinCircleR);

      const x = joinCircleH - this.joinCircleR <= 0 && this.smallCircleK < joinCircleK;
	  const crossOverY = getCircleYForX(joinCircleH, this.joinCircleR, 0);
      const largeArcFlag = (joinCircleK < this.smallCircleK) ? 0 : 1;
      const isOverlap = (joinCircleH - this.joinCircleR <= 0 && this.smallCircleK < joinCircleK);
	  this.lavaPath.setAttribute(
        'd',
        [
          "M " + coord1X + " " + coord1Y + " A " + this.bigCircleR + " " + this.bigCircleR + " 0 1 0 " + coord2X + " " + coord2Y,
          (!!x) && "A " + this.joinCircleR + " " + this.joinCircleR + " 0 0 1 0 " + (joinCircleK + crossOverY),
          (!!x) && "m 0 -" + (crossOverY * 2),
          "A " + this.joinCircleR + " " + this.joinCircleR + " 0 0 1 " + smallCircleIntersectX + " " + smallCircleIntersectY,
          "a " + this.smallCircleR + " " + this.smallCircleR + " 0 " + largeArcFlag + " 0 " + (smallCircleIntersectX * -2) + " 0",
          (!!isOverlap) && "A " + this.joinCircleR + " " + this.joinCircleR + " 0 0 1 0 " + (joinCircleK - crossOverY),
          (!!isOverlap) && "m 0 " + (crossOverY * 2),
          "A " + this.joinCircleR + " " + this.joinCircleR + " 0 0 1 " + coord1X + " " + coord1Y,
          "A " + this.joinCircleR + " " + this.joinCircleR + " 0 0 1 " + coord1X + " " + coord1Y,
        ]
          .filter(e => !!e)
          .join(),
      );

    }
	
	this.collapse = function(coords)
	{
		var increment = VISCOSITY / 4;
		var newK = this.smallCircleK + increment;
		
		if (newK > -this.bigCircleR + this.smallCircleR - 1)
		{
			this.bigCircleR = this.bigCircleRMax;
			this.reset();
		}
		else
		{
			var distance = -newK - (this.bigCircleRMax - this.smallCircleR);
			var angle = calculateAngle([this.bigCircleH, this.bigCircleK], coords);
			
			this.drawSomething(distance, angle, 'separation');
			setTimeout(function()
				{
					self.collapse(coords);
				}, 25);
		}
	}
	
	this.join = function(coords)
	{
		var increment = 20;
		var newK = this.smallCircleK + increment;
		
		if (newK > -this.bigCircleR + this.smallCircleR - 1)
		{
			this.bigCircleR = this.bigCircleRMax;
			this.lavaPath.setAttributeNS(null, "class", "lavaPath");
			this.reset();
		}
		else
		{
			var distance = -newK - (this.bigCircleRMax - this.smallCircleR);
			var angle = calculateAngle([this.bigCircleH, this.bigCircleK], coords);
			
			this.drawSomething(distance, angle, 'join');
			setTimeout(function()
				{
					self.join(coords);
				}, 25);
		}
	}
	
	this.mousedown = function(event)
	{
		self.mousedownCoords = coordsGlobalToSVG(event.clientX, event.clientY);

		self.bigCircleOriginH = self.bigCircleH;
		self.bigCircleOriginK = self.bigCircleK;

		self.originDistance = Math.sqrt(Math.pow(self.mousedownCoords[0] - self.bigCircleH, 2) + Math.pow(self.mousedownCoords[1] - self.bigCircleK, 2));
		
		self.smallCircleR = self.bigCircleR - self.originDistance;

		 /* If click in centre, move blob instead of separating */
		if (self.originDistance < 20)
		{
			document.addEventListener("mousemove", self.mousemove, false);
			document.addEventListener("mouseup", self.mouseup, false);
		}
		else
		{
			var bigCircleArea = Math.PI * Math.pow(self.bigCircleR, 2);
			var smallCircleArea = Math.PI * Math.pow(self.smallCircleR, 2);
			var afterCircleArea = bigCircleArea - smallCircleArea;
			
			self.bigCircleRMax = self.bigCircleR;
			self.bigCircleRMin = Math.sqrt(afterCircleArea / Math.PI);
			
			document.addEventListener("mousemove", self.mousemoveSeparate, false);
			document.addEventListener("mouseup", self.mouseupSeparate, false);
		}

        suppressPropagation(event);
	};
	
	this.mousemove = function(event)
	{
		var coords = coordsGlobalToSVG(event.clientX, event.clientY);
		
		self.lavaPath.setAttributeNS(null, "class", "lavaPath");

		self.bigCircleH = self.bigCircleOriginH + coords[0] - self.mousedownCoords[0];
		self.bigCircleK = self.bigCircleOriginK + coords[1] - self.mousedownCoords[1];
		
			var paths = document.getElementsByTagName("path");

			for (var i = 0; i < paths.length; i++)
			{
				var objRef = paths[i].objRef;

				var distance = Math.sqrt(Math.pow(self.bigCircleH - objRef.bigCircleH, 2) + Math.pow(self.bigCircleK - objRef.bigCircleK, 2))

				if (paths[i] != self.lavaPath && distance < self.bigCircleR + objRef.bigCircleR)
				{
					var bigCircleArea = Math.PI * Math.pow(objRef.bigCircleR, 2);
					var smallCircleArea = Math.PI * Math.pow(self.bigCircleR, 2);
					var afterCircleArea = bigCircleArea + smallCircleArea;

					if (self.bigCircleR < objRef.bigCircleR)
					{
						objRef.bigCircleRMin = objRef.bigCircleR;
						objRef.bigCircleRMax = Math.sqrt(afterCircleArea / Math.PI);
						objRef.smallCircleR = self.bigCircleR;
						objRef.smallCircleOriginH = self.bigCircleOriginH;
						objRef.smallCircleOriginK = self.bigCircleOriginK;
						objRef.mousedownCoords = self.mousedownCoords;

						var distanceDiff = distance - objRef.bigCircleRMax + objRef.smallCircleR;

						if (distanceDiff < 1)
						{
							distanceDiff = 1;
						}

						objRef.drawSomething(distanceDiff, calculateAngle([objRef.bigCircleH, objRef.bigCircleK],[self.bigCircleH, self.bigCircleK]), 'join');

						document.addEventListener("mousemove", objRef.mousemoveJoin, false);
						document.addEventListener("mouseup", objRef.mouseupJoin, false);
						document.removeEventListener("mousemove", self.mousemove, false);
						document.removeEventListener("mouseup", self.mouseup, false);

						self.lavaPath.parentNode.removeChild(self.lavaPath);
					}
					else
					{
						objRef.bigCircleRMin = self.bigCircleR;
						objRef.bigCircleRMax = Math.sqrt(afterCircleArea / Math.PI);
						objRef.smallCircleR = objRef.bigCircleR;
						objRef.smallCircleOriginH = objRef.bigCircleH;
						objRef.smallCircleOriginK = objRef.bigCircleK;
						objRef.bigCircleR = self.bigCircleR;
						objRef.bigCircleH = self.bigCircleH;
						objRef.bigCircleK = self.bigCircleK;
						objRef.bigCircleOriginH = self.bigCircleOriginH;
						objRef.bigCircleOriginK = self.bigCircleOriginK;
						objRef.mousedownCoords = self.mousedownCoords;

						var distanceDiff = distance - objRef.bigCircleRMax + objRef.smallCircleR;

						if (distanceDiff < 1)
						{
							distanceDiff = 1;
						}

						objRef.drawSomething(distanceDiff, calculateAngle([objRef.bigCircleH, objRef.bigCircleK],[objRef.smallCircleOriginH, objRef.smallCircleOriginK]), 'join');

						document.addEventListener("mousemove", objRef.mousemoveJoinAlt, false);
						document.addEventListener("mouseup", objRef.mouseupJoinAlt, false);
						document.removeEventListener("mousemove", self.mousemove, false);
						document.removeEventListener("mouseup", self.mouseup, false);

						self.lavaPath.parentNode.removeChild(self.lavaPath);
					}

					break;
				}
			}
		
		self.reset();

        suppressPropagation(event);
	};
	
	this.mousemoveSeparate = function(event)
	{
		var coords = coordsGlobalToSVG(event.clientX, event.clientY);
		
		var distance = Math.sqrt(Math.pow(coords[0] - self.bigCircleH, 2) + Math.pow(coords[1] - self.bigCircleK, 2));

		if (distance > self.bigCircleR + self.joinCircleR * 2 + self.smallCircleR)
		{
			var detached = new Blob(self.smallCircleR, coords[0], coords[1]);
			detached.lavaPath.setAttributeNS(null, "class", "lavaPath joining");

			
			document.addEventListener("mousemove", detached.mousemove, false);
			document.addEventListener("mouseup", detached.mouseup, false);
			document.removeEventListener("mousemove", self.mousemoveSeparate, false);
			document.removeEventListener("mouseup", self.mouseupSeparate, false);

			this.bigCircleR = this.bigCircleRMin;			
			self.reset();
		}
		else
		{
			var distanceDiff = distance - self.originDistance;

			if (distanceDiff < 1)
			{
				distanceDiff = 1;
			}

			self.drawSomething(distanceDiff, calculateAngle([self.bigCircleH, self.bigCircleK], coords), 'separation');
		}

        suppressPropagation(event);
	};
	
	this.mousemoveJoin = function(event)
	{
		var coords = coordsGlobalToSVG(event.clientX, event.clientY);
		
		var distance = Math.sqrt(Math.pow(self.smallCircleOriginH + coords[0] - self.mousedownCoords[0] - self.bigCircleH, 2) + Math.pow(self.smallCircleOriginK + coords[1] - self.mousedownCoords[1] - self.bigCircleK, 2));

		if (distance > self.bigCircleRMin + self.smallCircleR)
		{
			var detached = new Blob(self.smallCircleR, coords[0], coords[1]);
			
			document.addEventListener("mousemove", detached.mousemove, false);
			document.addEventListener("mouseup", detached.mouseup, false);
			document.removeEventListener("mousemove", self.mousemoveJoin, false);
			document.removeEventListener("mouseup", self.mouseupJoin, false);

			self.lavaPath.setAttributeNS(null, "class", "lavaPath");
			self.bigCircleR = self.bigCircleRMin;			
			self.reset();
		}
		else
		{
			var distanceDiff = distance - self.bigCircleRMax + self.smallCircleR;

			if (distanceDiff < 1)
			{
				distanceDiff = 1;
			}

			self.drawSomething(distanceDiff, calculateAngle([self.bigCircleH, self.bigCircleK], [self.smallCircleOriginH + coords[0] - self.mousedownCoords[0], self.smallCircleOriginK + coords[1] - self.mousedownCoords[1]]), 'join');
		}

        suppressPropagation(event);
	};
	
	this.mousemoveJoinAlt = function(event)
	{
		var coords = coordsGlobalToSVG(event.clientX, event.clientY);

		self.bigCircleH = self.bigCircleOriginH + coords[0] - self.mousedownCoords[0];
		self.bigCircleK = self.bigCircleOriginK + coords[1] - self.mousedownCoords[1];
		
		var distance = Math.sqrt(Math.pow(self.bigCircleH - self.smallCircleOriginH, 2) + Math.pow(self.bigCircleK - self.smallCircleOriginK, 2));

		if (distance > self.bigCircleRMin + self.smallCircleR)
		{
			var detached = new Blob(self.smallCircleR, self.smallCircleOriginH, self.smallCircleOriginK);
			
			document.addEventListener("mousemove", self.mousemove, false);
			document.addEventListener("mouseup", self.mouseup, false);
			document.removeEventListener("mousemove", self.mousemoveJoinAlt, false);
			document.removeEventListener("mouseup", self.mouseupJoinAlt, false);

			self.bigCircleR = self.bigCircleRMin;			
			self.reset();
		}
		else
		{
			var distanceDiff = distance - self.bigCircleRMax + self.smallCircleR;

			if (distanceDiff < 1)
			{
				distanceDiff = 1;
			}

			self.drawSomething(distanceDiff, calculateAngle([self.bigCircleH, self.bigCircleK], [self.smallCircleOriginH, self.smallCircleOriginK]), 'join');
		}

        suppressPropagation(event);
	};
	
	this.mouseup = function(event)
	{
		self.lavaPath.setAttributeNS(null, "class", "lavaPath");
		
		document.removeEventListener("mousemove", self.mousemove, false);
		document.removeEventListener("mouseup", self.mouseup, false);

        
        suppressPropagation(event);
	};

	this.mouseupSeparate = function(event)
	{
		var coords = coordsGlobalToSVG(event.clientX, event.clientY);
		self.collapse(coords);
		
		document.removeEventListener("mousemove", self.mousemoveSeparate, false);
		document.removeEventListener("mouseup", self.mouseupSeparate, false);

        suppressPropagation(event);
	};

	this.mouseupJoin = function(event)
	{
		var coords = coordsGlobalToSVG(event.clientX, event.clientY);
		self.join(coords);
		
		document.removeEventListener("mousemove", self.mousemoveJoin, false);
		document.removeEventListener("mouseup", self.mouseupJoin, false);

        suppressPropagation(event);
	};

	this.mouseupJoinAlt = function(event) {
      self.join(
        [
          self.smallCircleOriginH,
          self.smallCircleOriginK,
        ],
      );

	  document.removeEventListener("mousemove", self.mousemoveJoinAlt, false);
	  document.removeEventListener("mouseup", self.mouseupJoinAlt, false);

      suppressPropagation(event);
	};

	this.lavaPath.addEventListener("mousedown", this.mousedown, false);
		
	document.getElementsByTagName("svg")[0].appendChild(this.lavaPath);
	
	this.reset();
};

const suppressPropagation = (e) => {
  e.stopPropagation();
  e.preventDefault();
};

function coordsGlobalToSVG(globalX, globalY)
{
	var svgCoords = [0, 0];
	var svg = document.getElementsByTagName("svg")[0];
	var viewBox = svg.viewBox.baseVal;
	var viewBoxWidth = viewBox.width;
	var viewBoxHeight = viewBox.height;
	var viewBoxRatio = viewBoxWidth / viewBoxHeight;
	var viewportSize = getViewportSize();
	var viewportRatio = viewportSize[0] / viewportSize[1];
	
	if (viewBoxRatio <= viewportRatio)
	{
		svgCoords[1] = globalY * (viewBoxHeight / viewportSize[1]);

		var viewBoxGlobalWidth = viewBoxWidth * (viewportSize[1] / viewBoxHeight);
		var viewBoxGlobalOriginX = (viewportSize[0] - viewBoxGlobalWidth) / 2;
		svgCoords[0] = (globalX - viewBoxGlobalOriginX) * (viewBoxHeight / viewportSize[1]);
	}
	else
	{
		svgCoords[0] = globalX * (viewBoxWidth / viewportSize[0]);

		var viewBoxGlobalHeight = viewBoxHeight * (viewportSize[0] / viewBoxWidth);		
		var viewBoxGlobalOriginY = (viewportSize[1] - viewBoxGlobalHeight) / 2;
		svgCoords[1] = (globalY - viewBoxGlobalOriginY) * (viewBoxWidth / viewportSize[0]);
	}
	
	return svgCoords;
};

const getCircleYForX = (h, r, x) => Math.sqrt(Math.pow(r, 2) - Math.pow(x - h, 2));

const calculateAngle = (origin, point) => {
  const angle = Math.atan((point[1] - origin[1]) / (point[0] - origin[0])) / Math.PI * 180 + 90;
  return angle + ((point[0] < origin[0]) ? 180 : 0);
}

const getViewportSize = () => {
  if (typeof window.innerWidth != 'undefined') {
	return [
      window.innerWidth,
      window.innerHeight,
    ];
  } else if (typeof document.documentElement != 'undefined'	&& typeof document.documentElement.clientWidth != 'undefined'	&& document.documentElement.clientWidth != 0) {
	return [
      document.documentElement.clientWidth,
      document.documentElement.clientHeight,
    ];
  }
  return [0, 0];
};
