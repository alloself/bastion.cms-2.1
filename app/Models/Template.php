<?php

namespace App\Models;

class Template extends CRUDModel
{
    protected $fillable = ['name', 'value'];

    protected array $searchable = ['name'];
}
