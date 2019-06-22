function switchAnimation(file_path) {
    switch (file_path) {

        case "assets/FullTest.json":

            animateFullTest();
            ClearALL();
            break;

        case "assets/TriangleShadingTest.json":
        case "assets/TriangleTest.json":

            animateTriangleTest();
            ClearALL();
            break;

        case "assets/SphereTest.json":
        case "assets/SphereShadingTest1.json":
        case "assets/SphereShadingTest2.json":

            animateSphereTest();
            ClearALL();
            break;


        case "assets/ShadowTest1.json":
        case "assets/ShadowTest2.json":

            animateShadowTest();
            ClearALL();
            break;

        case "assets/CornellBox.json":

            animateCornellBox();
            ClearALL();
            break;



        case "assets/RecursiveTest.json":

            animateRecursiveTest();
            ClearALL();
            break;


        case "assets/TransformationTest.json":

            animateTransformationTest();
            ClearALL();
            break;

    }


}


function animateFullTest() {

    let animate1;
    let animate2;
    let num = 7 * FRAMES;
    let maxFrames = num / 6;
    if (num % 6 != 0) {
        maxFrames++;
    }

    for (countRepetitionsGif = 0; countRepetitionsGif <= (maxFrames); countRepetitionsGif++) {


        animate1 = 1.5 * Math.sin((countRepetitionsGif / FRAMES) * (Math.PI));
        if (animate1 >= 0)
            surfaces[0].setcenter([1, animate1, -1]);
        else {
            surfaces[0].setcenter([1, 0, -1]);
        }

        animate2 = 1.5 * Math.sin((countRepetitionsGif / FRAMES) * (Math.PI) - Math.PI / 6);
        if (animate2 >= 0)
            surfaces[1].setcenter([-1, animate2, 0]);
        else {
            surfaces[1].setcenter([-1, 0, 0]);

        }

        render();

    }



}

function animateTriangleTest() {

    let theta = 0;

    for (countRepetitionsGif = 0; countRepetitionsGif <= (FRAMES); countRepetitionsGif++) {

        theta = 2 * countRepetitionsGif * Math.PI / FRAMES;


        surfaces[0].setPoints([Math.cos(theta + Math.PI), -1 + Math.sin(theta + Math.PI), -3], [0, 1, -3], [Math.cos(theta), -1 + Math.sin(theta), -3])

        render();

    }


}

function animateSphereTest() {
    let animate1;


    for (countRepetitionsGif = 0; countRepetitionsGif <= (FRAMES); countRepetitionsGif++) {


        animate1 = 0.15 * Math.sin((countRepetitionsGif * 2 * Math.PI) / FRAMES);

        surfaces[0].setcenter([animate1, 0, -3]);


        render();
    }
}

function animateShadowTest() {

    let animate1;


    for (countRepetitionsGif = 0; countRepetitionsGif <= (FRAMES); countRepetitionsGif++) {


        animate1 = 0.5 * Math.sin((countRepetitionsGif * Math.PI) / FRAMES);

        surfaces[0].setcenter([0, 0, -2.74 + animate1]);


        render();
    }
}



function animateCornellBox() {

    let animate1;
    let animate2;
    let num = 7 * FRAMES;
    let maxFrames = num / 6;
    if (num % 6 != 0) {
        maxFrames++;
    }
    let movementWidth = 5;

    for (countRepetitionsGif = 0; countRepetitionsGif <= (maxFrames); countRepetitionsGif++) {


        animate1 = movementWidth * Math.sin((countRepetitionsGif / FRAMES) * (Math.PI));
        if (animate1 >= 0)
            surfaces[0].setcenter([5, -6, 1 + animate1]);
        else {
            surfaces[0].setcenter([5, -6, 1]);
        }

        animate2 = movementWidth * Math.sin((countRepetitionsGif / FRAMES) * (Math.PI) - Math.PI / 6);
        if (animate2 >= 0)
            surfaces[1].setcenter([-5, -6 + animate2, -5]);
        else {
            surfaces[1].setcenter([-5, -6, -5]);

        }


        render();

    }

}

function animateRecursiveTest() {

    let animate1;

    for (countRepetitionsGif = 0; countRepetitionsGif <= (FRAMES); countRepetitionsGif++) {


        animate1 = 0.25 * Math.sin((countRepetitionsGif * Math.PI) / FRAMES);
        surfaces[0].setcenter([animate1, 0, 0]);
        surfaces[1].setcenter([-animate1, 0, 0]);
        surfaces[2].setcenter([0, animate1, 0]);
        surfaces[3].setcenter([0, -animate1, 0]);


        render();
    }
}

function animateTransformationTest() {


    let animate1;
    for (countRepetitionsGif = 0; countRepetitionsGif <= (FRAMES); countRepetitionsGif++) {

        animate1 = 0.5 * Math.sin((countRepetitionsGif * Math.PI) / FRAMES);
        console.log(0.5 + animate1);
        surfaces[0].resetMatrix();
        scene.surfaces[0].transforms.forEach(function (transformsArrayMember) {

            switch (transformsArrayMember[0]) {
                case "Translate":
                    surfaces[0].setTranslation(transformsArrayMember[1]);
                    break;
                case "Rotate":
                    surfaces[0].setRotation(transformsArrayMember[1]);
                    break;
                case "Scale":
                    surfaces[0].setScaling([0.5 + animate1, 1, 1]);
                    break;
            }
        });

        surfaces[0].invertMatrix();
        surfaces[0].transposeInvertedMatrix();
        render();
    }
}
