# This file is a part of ValueShapes.jl, licensed under the MIT License (MIT).

using ValueShapes
using Test

using Statistics, StatsBase, Distributions, IntervalSets

@testset "NamedTupleDist" begin
    dist = @inferred NamedTupleDist(
        a = 5, b = Normal(),
        c = -4..5,
        d = MvNormal([1.2 0.5; 0.5 2.1]),
        x = [3 4; 2 5],
        e = [Normal(1.1, 0.2)]
    )

    @test typeof(@inferred varshape(dist)) <: NamedTupleShape

    shape = varshape(dist)
    shapes = map(varshape, dist)

    for k in keys(dist)
        @test getproperty(shapes, k) == varshape(getproperty(dist, k))
    end

    X_unshaped = [0.2, -0.4, 0.3, -0.5, 0.9]
    X_shaped = shape(X_unshaped)
    @test (@inferred logpdf(unshaped(dist), X_unshaped)) == logpdf(Normal(), 0.2) + logpdf(Uniform(-4, 5), -0.4) + logpdf(MvNormal([1.2 0.5; 0.5 2.1]), [0.3, -0.5]) + logpdf(Normal(1.1, 0.2), 0.9)
    @test (@inferred logpdf(dist, X_shaped)) == logpdf(unshaped(dist), X_unshaped)
    @test (@inferred logpdf(dist, X_shaped[])) == logpdf(unshaped(dist), X_unshaped)

    @test (@inferred mode(unshaped(dist))) == [0.0, 0.5, 0.0, 0.0, 1.1]
    @test (@inferred mode(dist)) == shape(mode(unshaped(dist)))[]

    @test @inferred(var(unshaped(dist))) ≈ [1.0, 6.75, 1.2, 2.1, 0.04]
    @test @inferred(var(dist)) == (a = 0, b = var(dist.b), c = var(dist.c), d = var(dist.d), x = var(dist.x), e = var(dist.e))

    @test begin
        ref_cov =
            [1.0  0.0   0.0  0.0 0.0;
             0.0  6.75  0.0  0.0 0.0;
             0.0  0.0   1.2  0.5 0.0;
             0.0  0.0   0.5  2.1 0.0;
             0.0  0.0   0.0  0.0 0.04 ]

        @static if VERSION >= v"1.2"
            (@inferred cov(unshaped(dist))) ≈ ref_cov
        else
            (cov(unshaped(dist))) ≈ ref_cov
        end
    end

    @test @inferred(rand(dist)) isa NamedTuple
    @test pdf(dist, rand(dist)) > 0
    @test @inferred(rand(dist, ())) isa ShapedAsNT
    @test pdf(dist, rand(dist, ())) > 0
    @test @inferred(rand(dist, 100)) isa ShapedAsNTArray
    @test all(x -> x > 0, pdf.(Ref(dist), rand(dist, 10^3)))

    testrng() = MersenneTwister(0xaef035069e01e678)

    @test @inferred(rand(unshaped(dist))) isa Vector{Float64}
    @test shape(@inferred(rand(testrng(), unshaped(dist))))[] == @inferred(rand(testrng(), dist, ()))[] == @inferred(rand(testrng(), dist))
    @test @inferred(rand(unshaped(dist), 10^3)) isa Matrix{Float64}
    @test shape.(nestedview(@inferred(rand(testrng(), unshaped(dist), 10^3)))) == @inferred(rand(testrng(), dist, 10^3))

    dist_h = @inferred NamedTupleDist(
        h1 = fit(Histogram, randn(10^5)),
        h2 = fit(Histogram, (2 * randn(10^5), 3 * randn(10^5)))
    )
    @test isapprox(std(@inferred(rand(unshaped(dist_h), 10^5)), dims = 2, corrected = true), [1, 2, 3], rtol = 0.1)

    propnames = propertynames(dist, true)
    @test propnames == (:a, :b, :c, :d, :x, :e, :_internal_distributions, :_internal_shape)
    @test @inferred(keys(dist)) == propertynames(dist, false)
    internaldists = getproperty(dist, :_internal_distributions)
    internalshape = getproperty(dist, :_internal_shape)
    @test all(i -> typeof(getindex(internaldists, i)) == typeof(getproperty(dist, keys(dist)[i])), 1:length(internaldists))
    @test all(key -> getproperty(getproperty(internalshape, key), :shape) == valshape(getproperty(internalshape, key)), keys(internalshape))

    @test @inferred(merge((a = 42,), NamedTupleDist(x = 5, z = Normal()))) == (a = 42, x = ConstValueDist(5), z = Normal())
    @test @inferred(NamedTupleDist((;dist...))) == dist
    @test @inferred(merge(dist)) === dist
    @test @inferred(merge(
        NamedTupleDist(x = Normal(), y = 42),
        NamedTupleDist(y = Normal(4, 5)),
        NamedTupleDist(z = Exponential(3), a = 4.2),
    )) == NamedTupleDist(x = Normal(), y = Normal(4, 5), z = Exponential(3), a = 4.2)
end
