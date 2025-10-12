<?php

namespace App\Models\Traits;


trait HasRender
{
    public static $renderRelations = [];


    public static function getRenderRelations()
    {
      return self::$renderRelations;
    }
  
}
