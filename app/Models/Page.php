<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = ['index', 'meta', 'parent_id', 'template_id'];
}
