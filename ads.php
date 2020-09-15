<?php

    header('Access-Control-Allow-Origin: *');

    $videos = file_get_contents('videoItems.json', true);

    echo $videos;