/*
DA IMPORTARE IN INDECS.HTML

una funzione per ogni animazione
funzione globale che in base al nome asset carica una certa funzione


*/

// let file_path = "assets/SphereTest.json";                0
// let file_path = "assets/TriangleTest.json";              1
// let file_path = "assets/TriangleShadingTest.json";       2
// let file_path = "assets/SphereShadingTest1.json";        3
// let file_path = "assets/SphereShadingTest2.json";        4
// let file_path = "assets/ShadowTest1.json";               5
// let file_path = "assets/ShadowTest2.json";               6
// let file_path = "assets/TransformationTest.json";        7
//let file_path = "assets/FullTest.json";                   8
// let file_path = "assets/RecursiveTest.json";             9
// let file_path = "assets/CornellBox.json";                10


function switchAnimation(file_path) {
    switch (file_path) {
        case "assets/SphereTest.json":

            break;

        case "assets/FullTest.json":

            animateFullTest();
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
    console.log(maxFrames);

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



        console.log("Computing Image Number: " + countRepetitionsGif);
        console.log(animate1);
        console.log("----------------------------");
        console.log(animate2);
        console.log("----------------------------");
        render();

    }

}

