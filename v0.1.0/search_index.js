var documenterSearchIndex = {"docs": [

{
    "location": "#",
    "page": "Home",
    "title": "Home",
    "category": "page",
    "text": ""
},

{
    "location": "#ShapesOfVariables.jl-1",
    "page": "Home",
    "title": "ShapesOfVariables.jl",
    "category": "section",
    "text": "ShapesOfVariables provides Julia types to describe the shape of values and to describe sets of named variables.This package aims to provide a bridge between user code operating on named structured variables and (e.g. fitting/optimization) algorithms operating on flat vectors of anonymous real values. ShapesOfVariables provides a zero-copy duality of view between both representations.ShapesOfVariables defines the shape of a value as the combination of it\'s data type (resp. element type, in the case of arrays) and the size of the value (relevant if the value is an array), e.g.using ShapesOfVariables\n\nScalarShape{Real}()\nArrayShape{Real}(2, 3)\nConstValueShape([1 2; 3 4])Array shapes can be used to construct a compatible array:Array(undef, ArrayShape{Real}(2, 3))Building on this, ShapesOfVariables provides a way to describe a set of named variables and their shapes:varshapes = VarShapes(\n    a = ScalarShape{Real}(),\n    b = ArrayShape{Real}(2, 3),\n    c = ConstValueShape([1 2; 3 4])\n)a, b, c could, e.g., be the parameters of a fit with c being held at a fixed value. This set of variables hastotalndof(varshapes) == 7total degrees of freedom (the constant c does not contribute). Instead of storing a concrete instance of values of these variables in a nested structure, the underlying values can also be stored in a real-valued flat vector of length 7:using Random\n\ndata = Vector{Float64}(undef, varshapes)\nsize(data) == (7,)\nrand!(data)from whichtupleview = varshapes(data)will construct a named tuple of the variable values, implemented as views into the vector data:typeof(tupleview) <: NamedTuple{(:a, :b, :c)}Note: The package EponymTuples may come in handy to define functions that take such tuples as parameters and deconstruct them, so that the variable names can be used directly inside the function body.ShapesOfVariables can also handle multiple values for sets of variables and is designed to compose well with ArraysOfArrays and TypedTables (and similar table packages):using ArraysOfArrays, Tables, TypedTables\n\nmultidata = VectorOfSimilarVectors{Int}(varshapes)\nresize!(multidata, 10)\nrand!(flatview(multidata), 0:99)\n\ntable = varshapes(multidata)\nkeys(Tables.columns(table)) == (:a, :b, :c)"
},

{
    "location": "api/#",
    "page": "API",
    "title": "API",
    "category": "page",
    "text": ""
},

{
    "location": "api/#API-1",
    "page": "API",
    "title": "API",
    "category": "section",
    "text": "DocTestSetup  = quote\n    using ShapesOfVariables\nend"
},

{
    "location": "api/#Types-1",
    "page": "API",
    "title": "Types",
    "category": "section",
    "text": "Order = [:type]"
},

{
    "location": "api/#Functions-1",
    "page": "API",
    "title": "Functions",
    "category": "section",
    "text": "Order = [:function]"
},

{
    "location": "api/#ShapesOfVariables.AbstractValueShape",
    "page": "API",
    "title": "ShapesOfVariables.AbstractValueShape",
    "category": "type",
    "text": "abstract type AbstractValueShape\n\nAn AbstractValueShape combines type and size information, the combination of which is termed shape, here. Subtypes are defined for shapes of scalars (see ScalarShape), arrays (see ArrayShape) and constant values (see ConstValueShape).\n\nSubtype of AbstractValueShape must support eltype, size and totalndof.\n\n\n\n\n\n"
},

{
    "location": "api/#ShapesOfVariables.ArrayShape",
    "page": "API",
    "title": "ShapesOfVariables.ArrayShape",
    "category": "type",
    "text": "ArrayShape{T,N} <: AbstractValueShape\n\nDescribes the shape of N-dimensional arrays of type T and a given size.\n\nConstructor:\n\nArrayShape{T}(dims::NTuple{N,Integer}) where {T,N}\nArrayShape{T}(dims::Integer...) where {T}\n\ne.g.\n\nshape = ArrayShape{Real}(2, 3)\n\nArray shapes can be used to instantiate array of the given shape, e.g.\n\nsize(Array(undef, shape)) == (2, 3)\nsize(ElasticArrays.ElasticArray(undef, shape)) == (2, 3)\n\nIf the element type of the shape of an abstract type of union, ShapesOfVariables.default_datatype will be used to determine a suitable more specific type, if possible:\n\neltype(Array(undef, shape)) == Float64\n\n\n\n\n\n"
},

{
    "location": "api/#ShapesOfVariables.ConstValueShape",
    "page": "API",
    "title": "ShapesOfVariables.ConstValueShape",
    "category": "type",
    "text": "ConstValueShape{T} <: AbstractValueShape\n\nA ConstValueShape describes the shape of constant values of type T.\n\nConstructor:\n\nConstValueShape(value)\n\nvalue may be of arbitrary type, e.g. a constant scalar value or array:\n\nConstValueShape(4.2),\nConstValueShape([11 21; 12 22]),\n\nShapes of constant values have zero degrees of freedom ((see totalndof).\n\n\n\n\n\n"
},

{
    "location": "api/#ShapesOfVariables.ScalarShape",
    "page": "API",
    "title": "ShapesOfVariables.ScalarShape",
    "category": "type",
    "text": "ScalarShape{T} <: AbstractValueShape\n\nAn ScalarShape describes the shape of scalar values of a given type.\n\nConstructor:\n\nScalarShape{T::Type}()\n\nT may be an abstract type of Union, or a specific type, e.g.\n\nScalarShape{Integer}()\nScalarShape{Real}()\nScalarShape{Complex}()\nScalarShape{Float32}()\n\nScalar shapes may have a total number of degrees of freedom (see totalndof) greater than one, e.g. shapes of complex-valued scalars:\n\ntotalndof(ScalarShape{Real}()) == 1\ntotalndof(ScalarShape{Complex}()) == 2\n\n\n\n\n\n"
},

{
    "location": "api/#ShapesOfVariables.VarShapes",
    "page": "API",
    "title": "ShapesOfVariables.VarShapes",
    "category": "type",
    "text": "VarShapes{N,AC}\n\nDefines the shapes of an ordered set of variables (resp. parameters, arguments, etc.). This forms the basis of viewing the content of all variables in a dual way as a NamedTuple and as a flattened vectors.\n\nScalar values have shape (), array values have shape (dim1, dim2, ...).\n\nConstructors:\n\nVarShapes(name1 = shape1, ...)\nVarShapes(varshapes::NamedTuple)\n\ne.g.\n\nvarshapes = VarShapes(\n    a = ArrayShape{Real}(2, 3),\n    b = ScalarShape{Real}(),\n    c = ArrayShape{Real}(4)\n)\n\nUse\n\n(varshapes::VarShapes)(data::AbstractVector)::NamedTuple\n\nto get correctly named and shaped views into a vector containing the flattened values of all variables. In return,\n\nBase.Vector{T}(::UndefInitializer, varshapes::VarShapes)\nBase.Vector(::UndefInitializer, varshapes::VarShapes)\n\nwill create a suitable uninitialized vector to hold such flattened data for a given set of variables. If no type T is given, a suitable non-abstract type will be chosen automatically via nonabstract_eltype(varshapes).\n\nWhen dealing with multiple vectors of flattened data,\n\n(varshapes::VarShapes)(\n    data::ArrayOfArrays.AbstractVectorOfSimilarVectors\n)::NamedTuple\n\ncreates a view of a vector of flattened data vectors as a table with the variable names as column names and the (possibly array-shaped) variable value views as entries. In return,\n\nArraysOfArrays.VectorOfSimilarVectors{T}(varshapes::VarShapes)\nArraysOfArrays.VectorOfSimilarVectors(varshapes::VarShapes)\n\nwill create a suitable vector (of length zero) of vectors to hold flattened value data. The result will be a VectorOfSimilarVectors wrapped around a 2-dimensional ElasticArray. Internally all data is stored in a single flat Vector{T}.\n\nExample:\n\nvarshapes = VarShapes(\n    a = ScalarShape{Real}(),\n    b = ArrayShape{Real}(2, 3),\n    c = ConstValueShape(42)\n)\ndata = VectorOfSimilarVectors{Float64}(varshapes)\nresize!(data, 10)\nrand!(flatview(data))\ntable = TypedTables.Table(varshapes(data))\nfill!(table.a, 4.2)\nall(x -> x == 4.2, view(flatview(data), 1, :))\n\n\n\n\n\n"
},

{
    "location": "api/#ShapesOfVariables.totalndof",
    "page": "API",
    "title": "ShapesOfVariables.totalndof",
    "category": "function",
    "text": "totalndof(shape::AbstractValueShape)\n\nGet the total number of degrees of freedom of values having the given shape.\n\nEquivalent to the size of the array required when flattening values of this shape into an array of real numbers, without including any constant values.\n\n\n\n\n\n"
},

{
    "location": "api/#ShapesOfVariables.default_datatype",
    "page": "API",
    "title": "ShapesOfVariables.default_datatype",
    "category": "function",
    "text": "ShapesOfVariables.default_datatype(T::Type)\n\nReturn a default specific type U that is more specific than T, with U <: T.\n\ne.g.\n\nShapesOfVariables.default_datatype(Real) == Float64\nShapesOfVariables.default_datatype(Complex) == Complex{Float64}\n\n\n\n\n\n"
},

{
    "location": "api/#Documentation-1",
    "page": "API",
    "title": "Documentation",
    "category": "section",
    "text": "Modules = [ShapesOfVariables]\nOrder = [:type, :function]"
},

{
    "location": "LICENSE/#",
    "page": "LICENSE",
    "title": "LICENSE",
    "category": "page",
    "text": ""
},

{
    "location": "LICENSE/#LICENSE-1",
    "page": "LICENSE",
    "title": "LICENSE",
    "category": "section",
    "text": "using Markdown\nMarkdown.parse_file(joinpath(@__DIR__, \"..\", \"..\", \"LICENSE.md\"))"
},

]}
